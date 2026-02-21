import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'external_id', type: 'int', nullable: true })
  externalId: number;

  @Column()
  name: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'text', array: true, nullable: true })
  sizes: string[];

  @Column({ type: 'text', array: true, nullable: true })
  colors: string[];

  @Column({ type: 'jsonb', nullable: true })
  images: Record<string, string>;

  @Column({ name: 'category_slug', type: 'varchar', nullable: true })
  categorySlug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
