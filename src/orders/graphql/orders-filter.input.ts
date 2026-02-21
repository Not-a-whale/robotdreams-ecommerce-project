import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { OrderStatus } from './order-status.enum';

@InputType()
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
