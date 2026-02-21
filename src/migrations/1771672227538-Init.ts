import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1771672227538 implements MigrationInterface {
  name = 'Init1771672227538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "external_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "short_description" text`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "products" ADD "sizes" text array`);
    await queryRunner.query(`ALTER TABLE "products" ADD "colors" text array`);
    await queryRunner.query(`ALTER TABLE "products" ADD "images" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "category_slug" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bbc46f4fc336522e99fc8782b4" ON "products" ("external_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbc46f4fc336522e99fc8782b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "category_slug"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "colors"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sizes"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "short_description"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "external_id"`);
  }
}
