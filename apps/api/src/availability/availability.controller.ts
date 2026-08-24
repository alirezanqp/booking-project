import { Body, Controller, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { PutWorkingHoursDto } from "./hours.dto";
import { JwtAuthGuard, type JwtPayload } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller()
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get("businesses/:id/available-slots")
  slots(
    @Param("id") id: string,
    @Query("serviceId") serviceId: string,
    @Query("date") date: string,
    @Query("professionalId") professionalId?: string,
  ) {
    return this.availability.slots(id, serviceId, date, professionalId);
  }

  @Get("professionals/:id/working-hours")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  getHours(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.availability.getHours(user.sub, id);
  }

  @Put("professionals/:id/working-hours")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  putHours(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: PutWorkingHoursDto,
  ) {
    return this.availability.putHours(user.sub, id, dto.hours);
  }
}
