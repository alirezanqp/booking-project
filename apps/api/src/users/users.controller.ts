import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard, type JwtPayload } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { AuthService } from "../auth/auth.service";
import { PatchMeDto } from "./dto";

@Controller()
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  async patch(@CurrentUser() user: JwtPayload, @Body() dto: PatchMeDto) {
    await this.prisma.user.update({
      where: { id: user.sub },
      data: { name: dto.name?.trim() },
    });
    return this.auth.me(user.sub);
  }
}
