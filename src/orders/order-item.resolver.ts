import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { OrderItemType } from './graphql/order-item.type';
import { ProductType } from '../products/graphql/product.type';
import { OrderItemEntity } from './order-item-entity';
import { ProductLoader } from 'src/products/product.loader';

@Resolver(() => OrderItemType)
export class OrderItemResolver {
  constructor(private readonly productLoader: ProductLoader) {}

  @ResolveField(() => ProductType)
  async product(
    @Parent() orderItem: OrderItemEntity,
  ): Promise<ProductType | null> {
    return this.productLoader.batchProducts.load(orderItem.productId);
  }
}
