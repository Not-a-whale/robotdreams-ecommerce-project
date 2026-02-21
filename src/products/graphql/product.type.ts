import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType('Product')
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field(() => Int, { nullable: true })
  externalId?: number;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  sizes?: string[];

  @Field(() => [String], { nullable: true })
  colors?: string[];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Field(() => GraphQLJSONObject, { nullable: true })
  images?: Record<string, any>;

  @Field({ nullable: true })
  categorySlug?: string;
}
