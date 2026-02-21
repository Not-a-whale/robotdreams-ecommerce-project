import { MigrationInterface, QueryRunner } from 'typeorm';

// Додаю індекс
export class AddOrdersUserCreatedAtIndex1700000000000 implements MigrationInterface {
  name = 'AddOrdersUserCreatedAtIndex1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
      ON orders (user_id, created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_orders_user_created_at;
    `);
  }
}
