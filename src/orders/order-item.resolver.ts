import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { OrderItemType } from './graphql/order-item.type';
import { ProductType } from '../products/graphql/product.type';
import { OrderItemEntity } from './order-item-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../products/product.entity';

@Resolver(() => OrderItemType)
export class OrderItemResolver {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  @ResolveField(() => ProductType)
  async product(
    @Parent() orderItem: OrderItemEntity,
  ): Promise<ProductEntity | null> {
    return this.productRepository.findOne({
      where: { id: orderItem.productId },
    });
  }
}
