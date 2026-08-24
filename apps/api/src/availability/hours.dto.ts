import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, Max, Min, ValidateNested } from "class-validator";

export class WorkingHourItemDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsInt()
  @Min(0)
  @Max(24 * 60)
  startMin!: number;

  @IsInt()
  @Min(0)
  @Max(24 * 60)
  endMin!: number;
}

export class PutWorkingHoursDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => WorkingHourItemDto)
  hours!: WorkingHourItemDto[];
}
