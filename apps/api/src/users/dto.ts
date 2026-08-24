import { IsOptional, IsString, MaxLength } from "class-validator";

export class PatchMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
