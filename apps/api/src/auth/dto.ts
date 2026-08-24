import { IsIn, IsOptional, IsString, Matches } from "class-validator";
import { USER_ROLES } from "../common/shared";

export class RequestOtpDto {
  @IsString()
  @Matches(/^[0-9+ ]{10,14}$/, { message: "شماره موبایل نامعتبر است" })
  phone!: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: (typeof USER_ROLES)[number];
}

export class VerifyOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: "کد تایید ۶ رقم است" })
  code!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: (typeof USER_ROLES)[number];
}
