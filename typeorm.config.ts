import { DataSource } from 'typeorm';

import { UserEntity } from './src/users/user.entity';
import { ProductEntity } from './src/products/product.entity';
import { OrderEntity } from './src/orders/order.entity';
import { OrderItemEntity } from './src/orders/order-item-entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? 'root',
  database: process.env.DB_NAME ?? 'ecommerce',
  entities: [UserEntity, ProductEntity, OrderEntity, OrderItemEntity],
  migrations: ['src/migrations/*.ts'],
});
