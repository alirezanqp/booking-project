import { IsISO8601, IsString } from "class-validator";

export class CreateBookingDto {
  @IsString()
  businessId!: string;

  @IsString()
  serviceId!: string;

  @IsString()
  professionalId!: string;

  @IsISO8601()
  startsAt!: string;
}
