import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductEntity } from 'src/products/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from './order-item-entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      ProductEntity,
      UserEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
