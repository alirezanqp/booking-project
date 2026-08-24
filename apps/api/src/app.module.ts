import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BusinessesModule } from "./businesses/businesses.module";
import { ServicesModule } from "./services/services.module";
import { AvailabilityModule } from "./availability/availability.module";
import { BookingsModule } from "./bookings/bookings.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    ServicesModule,
    AvailabilityModule,
    BookingsModule,
  ],
})
export class AppModule {}
