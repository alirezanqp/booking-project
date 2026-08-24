import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { isIranMobile, normalizePhone } from "../common/phone";
import type { JwtPayload } from "./jwt-auth.guard";

const OTP_TTL = 300;
const OTP_COOLDOWN = 45;
const REFRESH_TTL = 60 * 60 * 24 * 7;

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
  ) {}

  async requestOtp(phoneRaw: string) {
    const phone = normalizePhone(phoneRaw);
    if (!isIranMobile(phone)) {
      throw new BadRequestException("شماره موبایل نامعتبر است");
    }
    const coolKey = `otp:cool:${phone}`;
    if (await this.redis.client.get(coolKey)) {
      throw new HttpException("کمی بعد دوباره تلاش کنید", HttpStatus.TOO_MANY_REQUESTS);
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.redis.client.set(`otp:${phone}`, code, "EX", OTP_TTL);
    await this.redis.client.set(coolKey, "1", "EX", OTP_COOLDOWN);
    // ponytail: DevSmsAdapter — logs OTP; swap for Kavenegar/etc later
    console.log(`[DevSms] ${phone} code=${code}`);
    return { ok: true };
  }

  async verifyOtp(
    phoneRaw: string,
    code: string,
    name: string | undefined,
    role: UserRole | undefined,
    res: Response,
  ) {
    const phone = normalizePhone(phoneRaw);
    const stored = await this.redis.client.get(`otp:${phone}`);
    if (!stored || stored !== code) {
      throw new UnauthorizedException("کد تایید نادرست است");
    }
    await this.redis.client.del(`otp:${phone}`);

    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: { professional: true },
    });
    if (!user) {
      const nextRole = role ?? UserRole.CUSTOMER;
      user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { phone, name: name?.trim() || null, role: nextRole },
        });
        if (nextRole === UserRole.PROFESSIONAL) {
          const business = await tx.business.create({
            data: { name: "کسب‌وکار من", phone },
          });
          await tx.professional.create({
            data: {
              userId: created.id,
              businessId: business.id,
              isOwner: true,
            },
          });
        }
        return tx.user.findUniqueOrThrow({
          where: { id: created.id },
          include: { professional: true },
        });
      });
    } else if (name?.trim() && !user.name) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
        include: { professional: true },
      });
    }

    await this.setSession(res, { sub: user.id, role: user.role });
    return this.publicUser(user);
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) throw new UnauthorizedException("وارد شوید");
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException("نشست منقضی شده است");
    }
    const stored = await this.redis.client.get(`refresh:${payload.sub}`);
    if (stored !== refreshToken) throw new UnauthorizedException("وارد شوید");
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException("وارد شوید");
    await this.setSession(res, { sub: user.id, role: user.role });
    return { ok: true };
  }

  async logout(userId: string, res: Response) {
    await this.redis.client.del(`refresh:${userId}`);
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: { include: { business: true } } },
    });
    if (!user) throw new UnauthorizedException("وارد شوید");
    return this.publicUser(user);
  }

  private async setSession(res: Response, payload: JwtPayload) {
    const access = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "15m",
    });
    const refresh = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });
    await this.redis.client.set(`refresh:${payload.sub}`, refresh, "EX", REFRESH_TTL);
    res.cookie("access_token", access, { ...cookieBase, maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", refresh, {
      ...cookieBase,
      maxAge: REFRESH_TTL * 1000,
    });
  }

  private publicUser(user: {
    id: string;
    phone: string;
    name: string | null;
    role: UserRole;
    professional?: {
      id: string;
      businessId: string;
      business?: { id: string; name: string };
    } | null;
  }) {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      professional: user.professional
        ? {
            id: user.professional.id,
            businessId: user.professional.businessId,
            businessName: user.professional.business?.name,
          }
        : null,
    };
  }
}
