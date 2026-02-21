import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ProductType } from 'src/products/graphql/product.type';

@ObjectType('OrderItem')
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  qty: number;

  @Field(() => Int)
  priceAtPurchase: number;

  @Field(() => ProductType)
  product: ProductType;
}
