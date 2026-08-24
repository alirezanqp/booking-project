import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { SERVICE_CATEGORIES } from "../common/shared";

export class CreateServiceDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(SERVICE_CATEGORIES)
  category!: (typeof SERVICE_CATEGORIES)[number];

  @IsInt()
  @Min(0)
  priceIrr!: number;

  @IsInt()
  @Min(5)
  @Max(480)
  durationMin!: number;
}

export class PatchServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(SERVICE_CATEGORIES)
  category?: (typeof SERVICE_CATEGORIES)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  priceIrr?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMin?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
