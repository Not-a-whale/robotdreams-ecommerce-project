import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { OrderStatus } from './order-status.enum';
import { OrderItemType } from './order-item.type';

@ObjectType('Order')
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Int)
  totalPrice: number;

  @Field()
  createdAt: Date;

  @Field(() => [OrderItemType])
  items: OrderItemType[];
}
