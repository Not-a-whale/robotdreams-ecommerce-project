import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { OrderItemEntity } from './order-item-entity';

export type OrderStatus = 'CREATED' | 'PAID' | 'CANCELLED';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar' })
  status: OrderStatus;

  @Column({ name: 'total_price', type: 'int' })
  totalPrice: number;

  @Column({ name: 'idempotency_key', type: 'uuid', unique: true })
  idempotencyKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => OrderItemEntity, (i) => i.order)
  items: OrderItemEntity[];
}
