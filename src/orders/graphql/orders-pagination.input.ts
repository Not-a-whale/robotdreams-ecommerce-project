import { InputType, Field, Int } from '@nestjs/graphql';
import { Min, Max, IsOptional, IsInt } from 'class-validator';

@InputType()
export class OrdersPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
