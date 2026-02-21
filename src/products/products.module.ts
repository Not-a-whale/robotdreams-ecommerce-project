import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductLoader } from './product.loader';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  providers: [ProductLoader],
  exports: [ProductLoader, TypeOrmModule],
})
export class ProductsModule {}
