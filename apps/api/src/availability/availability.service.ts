import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { overlaps, parseCivilDate, tehranInstant } from "./time";

const GRID_MIN = 15;

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async slots(
    businessId: string,
    serviceId: string,
    date: string,
    professionalId?: string,
  ) {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, businessId, active: true },
    });
    if (!service) throw new NotFoundException("خدمت پیدا نشد");

    const pros = await this.prisma.professional.findMany({
      where: {
        businessId,
        ...(professionalId ? { id: professionalId } : {}),
      },
      include: { workingHours: true },
    });
    if (professionalId && !pros.length) {
      throw new NotFoundException("آرایشگر پیدا نشد");
    }
    const targets = professionalId ? pros : pros;
    if (!targets.length) return [];

    let civil;
    try {
      civil = parseCivilDate(date);
    } catch {
      throw new BadRequestException("تاریخ نامعتبر است");
    }

    const dayStart = tehranInstant(civil.y, civil.m, civil.d, 0);
    const dayEnd = tehranInstant(civil.y, civil.m, civil.d, 24 * 60);
    const now = new Date();

    const result: { professionalId: string; startsAt: string }[] = [];

    for (const pro of targets) {
      const window = pro.workingHours.find((h) => h.weekday === civil.weekday);
      if (!window || window.endMin - window.startMin < service.durationMin) continue;

      const bookings = await this.prisma.booking.findMany({
        where: {
          professionalId: pro.id,
          status: { not: BookingStatus.CANCELLED },
          startsAt: { lt: dayEnd },
          endsAt: { gt: dayStart },
        },
      });

      for (
        let t = window.startMin;
        t + service.durationMin <= window.endMin;
        t += GRID_MIN
      ) {
        const startsAt = tehranInstant(civil.y, civil.m, civil.d, t);
        const endsAt = tehranInstant(
          civil.y,
          civil.m,
          civil.d,
          t + service.durationMin,
        );
        if (startsAt <= now) continue;
        const clash = bookings.some((b) =>
          overlaps(startsAt, endsAt, b.startsAt, b.endsAt),
        );
        if (!clash) {
          result.push({ professionalId: pro.id, startsAt: startsAt.toISOString() });
        }
      }
    }
    return result;
  }

  async getHours(userId: string, professionalId: string) {
    await this.assertSelf(userId, professionalId);
    return this.prisma.workingHour.findMany({
      where: { professionalId },
      orderBy: { weekday: "asc" },
    });
  }

  async putHours(
    userId: string,
    professionalId: string,
    hours: { weekday: number; startMin: number; endMin: number }[],
  ) {
    await this.assertSelf(userId, professionalId);
    for (const h of hours) {
      if (h.endMin <= h.startMin) {
        throw new BadRequestException("ساعت پایان باید بعد از شروع باشد");
      }
    }
    await this.prisma.$transaction([
      this.prisma.workingHour.deleteMany({ where: { professionalId } }),
      ...hours.map((h) =>
        this.prisma.workingHour.create({
          data: { professionalId, ...h },
        }),
      ),
    ]);
    return this.prisma.workingHour.findMany({
      where: { professionalId },
      orderBy: { weekday: "asc" },
    });
  }

  private async assertSelf(userId: string, professionalId: string) {
    const pro = await this.prisma.professional.findUnique({
      where: { userId },
    });
    if (!pro || pro.id !== professionalId) {
      throw new ForbiddenException("دسترسی مجاز نیست");
    }
  }
}
