import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item-entity';
import { ProductEntity } from '../products/product.entity';
import { OrdersFilterInput } from './graphql/orders-filter.input';
import { OrdersPaginationInput } from './graphql/orders-pagination.input';

type PgError = {
  code?: string;
  constraint?: string;
};

function isPgUniqueViolation(
  error: unknown,
  constraint?: string,
): error is PgError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const pgError = error as PgError;

  if (pgError.code !== '23505') {
    return false;
  }

  if (constraint) {
    return pgError.constraint === constraint;
  }

  return true;
}

@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(
    filter?: OrdersFilterInput,
    pagination?: OrdersPaginationInput,
  ): Promise<OrderEntity[]> {
    const qb = this.dataSource
      .getRepository(OrderEntity)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (filter?.status) {
      qb.andWhere('order.status = :status', { status: filter.status });
    }

    if (filter?.userId) {
      qb.andWhere('order.userId = :userId', { userId: filter.userId });
    }

    if (filter?.dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: filter.dateFrom,
      });
    }

    if (filter?.dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', { dateTo: filter.dateTo });
    }

    qb.orderBy('order.createdAt', 'DESC');

    if (pagination) {
      qb.limit(pagination.limit).offset(pagination.offset);
    }

    return qb.getMany();
  }

  async createOrder(dto: CreateOrderDto, idempotencyKey: string) {
    // ловим 500-ті
    if (!dto?.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('items[] is required');
    }

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(OrderEntity, {
        where: { idempotencyKey },
        relations: ['items'],
      });

      if (existing) {
        return existing;
      }
      // тут я лочу
      const productIds = dto.items.map((i) => i.productId);

      const products = await queryRunner.manager
        .createQueryBuilder(ProductEntity, 'p')
        .where('p.id IN (:...ids)', { ids: productIds })
        .setLock('pessimistic_write')
        .getMany();

      if (products.length !== productIds.length) {
        throw new BadRequestException('Some products not found');
      }
      for (const item of dto.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new BadRequestException('Product is not found');

        if (product.stock < item.qty) {
          throw new ConflictException(`Not enough stock for ${product.name}`);
        }
      }
      let total = 0;

      for (const item of dto.items) {
        const product = products.find((p) => p.id === item.productId);
        total += product!.price * item.qty;
      }
      const order = queryRunner.manager.create(OrderEntity, {
        userId: dto.userId,
        status: 'CREATED',
        totalPrice: total,
        idempotencyKey,
      });
      await queryRunner.manager.save(order);
      for (const item of dto.items) {
        const product = products.find((p) => p.id === item.productId);

        const orderItem = queryRunner.manager.create(OrderItemEntity, {
          orderId: order.id,
          productId: product!.id,
          qty: item.qty,
          priceAtPurchase: product!.price,
        });

        await queryRunner.manager.save(orderItem);

        product!.stock -= item.qty;
        await queryRunner.manager.save(product);
      }

      await queryRunner.commitTransaction();

      return order;
    } catch (err) {
      console.error('createOrder failed:', err);
      await queryRunner.rollbackTransaction();

      if (isPgUniqueViolation(err, 'uq_orders_idempotency_key')) {
        const existing = await this.dataSource.manager.findOne(OrderEntity, {
          where: { idempotencyKey },
        });

        if (existing) {
          return existing;
        }
      }

      throw err instanceof ConflictException ||
        err instanceof BadRequestException
        ? err
        : new InternalServerErrorException('Order creation failed');
    } finally {
      await queryRunner.release();
    }
  }
}
