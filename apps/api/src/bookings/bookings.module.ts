import { Module } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { AuthModule } from "../auth/auth.module";
import { AvailabilityModule } from "../availability/availability.module";

@Module({
  imports: [AuthModule, AvailabilityModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
