import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../products/product.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => OrderEntity, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'int' })
  qty: number;

  @Column({ name: 'price_at_purchase', type: 'int' })
  priceAtPurchase: number;
}
