import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { OrdersFilterInput } from './graphql/orders-filter.input';
import { OrdersPaginationInput } from './graphql/orders-pagination.input';
import { OrdersService } from './orders.service';
import { OrderEntity } from './order.entity';
import { OrderType } from './graphql/order.type';
import { OrderItemType } from './graphql/order-item.type';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [OrderType], { name: 'orders' })
  async getOrders(
    @Args('filter', { type: () => OrdersFilterInput, nullable: true })
    filter?: OrdersFilterInput,
    @Args('pagination', { type: () => OrdersPaginationInput, nullable: true })
    pagination?: OrdersPaginationInput,
  ): Promise<OrderEntity[]> {
    return this.ordersService.findAll(filter, pagination);
  }

  @ResolveField(() => [OrderItemType])
  items(@Parent() order: OrderEntity): OrderItemType[] {
    return order.items || [];
  }
}
