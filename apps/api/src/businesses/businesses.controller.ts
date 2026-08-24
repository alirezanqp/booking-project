import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BusinessesService } from "./businesses.service";
import { PatchBusinessDto } from "./dto";
import { JwtAuthGuard, type JwtPayload } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("businesses")
export class BusinessesController {
  constructor(private readonly businesses: BusinessesService) {}

  @Get()
  list(
    @Query("q") q?: string,
    @Query("category") category?: string,
    @Query("city") city?: string,
  ) {
    return this.businesses.list(q, category, city);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.businesses.get(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  patch(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: PatchBusinessDto,
  ) {
    return this.businesses.update(user.sub, id, dto);
  }
}
