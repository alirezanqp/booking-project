import { Module } from "@nestjs/common";
import { ServicesController } from "./services.controller";
import { BusinessesModule } from "../businesses/businesses.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule, BusinessesModule],
  controllers: [ServicesController],
})
export class ServicesModule {}
