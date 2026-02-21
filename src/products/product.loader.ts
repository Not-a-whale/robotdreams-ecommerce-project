import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductLoader {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  public readonly batchProducts = new DataLoader<string, ProductEntity | null>(
    async (productIds: readonly string[]) => {
      const products = await this.productRepository.find({
        where: { id: In([...productIds]) },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      return productIds.map((id) => productMap.get(id) || null);
    },
  );
}
