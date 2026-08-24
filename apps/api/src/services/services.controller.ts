import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessesService } from "../businesses/businesses.service";
import { CreateServiceDto, PatchServiceDto } from "./dto";
import { JwtAuthGuard, type JwtPayload } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { Roles, RolesGuard } from "../auth/roles.guard";
import { NotFoundException } from "@nestjs/common";

@Controller()
export class ServicesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businesses: BusinessesService,
  ) {}

  @Get("businesses/:id/services")
  list(@Param("id") id: string, @Query("all") all?: string) {
    return this.prisma.service.findMany({
      where: {
        businessId: id,
        ...(all === "1" ? {} : { active: true }),
      },
      orderBy: { name: "asc" },
    });
  }

  @Post("businesses/:id/services")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  async create(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: CreateServiceDto,
  ) {
    await this.businesses.assertOwner(user.sub, id);
    return this.prisma.service.create({
      data: {
        businessId: id,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        priceIrr: dto.priceIrr,
        durationMin: dto.durationMin,
      },
    });
  }

  @Patch("services/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  async patch(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: PatchServiceDto,
  ) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("خدمت پیدا نشد");
    await this.businesses.assertOwner(user.sub, service.businessId);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  @Delete("services/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("PROFESSIONAL")
  async remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("خدمت پیدا نشد");
    await this.businesses.assertOwner(user.sub, service.businessId);
    await this.prisma.service.delete({ where: { id } });
    return { ok: true };
  }
}
