import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AvailabilityService } from "../availability/availability.service";

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  async create(
    customerId: string,
    dto: {
      businessId: string;
      serviceId: string;
      professionalId: string;
      startsAt: string;
    },
  ) {
    const startsAt = new Date(dto.startsAt);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      throw new BadRequestException("زمان نامعتبر است");
    }

    const service = await this.prisma.service.findFirst({
      where: {
        id: dto.serviceId,
        businessId: dto.businessId,
        active: true,
      },
    });
    if (!service) throw new NotFoundException("خدمت پیدا نشد");

    const pro = await this.prisma.professional.findFirst({
      where: { id: dto.professionalId, businessId: dto.businessId },
    });
    if (!pro) throw new NotFoundException("آرایشگر پیدا نشد");

    const tehran = new Date(startsAt.getTime() + (3 * 60 + 30) * 60 * 1000);
    const date = `${tehran.getUTCFullYear()}-${String(tehran.getUTCMonth() + 1).padStart(2, "0")}-${String(tehran.getUTCDate()).padStart(2, "0")}`;
    const slots = await this.availability.slots(
      dto.businessId,
      dto.serviceId,
      date,
      dto.professionalId,
    );
    if (!slots.some((s) => s.startsAt === startsAt.toISOString())) {
      throw new ConflictException("این زمان در دسترس نیست");
    }

    const endsAt = new Date(startsAt.getTime() + service.durationMin * 60 * 1000);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const clash = await tx.booking.findFirst({
          where: {
            professionalId: pro.id,
            status: { not: BookingStatus.CANCELLED },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
        });
        if (clash) {
          throw new ConflictException("این زمان قبلاً رزرو شده است");
        }
        return tx.booking.create({
          data: {
            customerId,
            professionalId: pro.id,
            businessId: dto.businessId,
            serviceId: service.id,
            startsAt,
            endsAt,
            status: BookingStatus.CONFIRMED,
            priceIrr: service.priceIrr,
          },
          include: bookingInclude,
        });
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      if (isOverlapError(err)) {
        throw new ConflictException("این زمان قبلاً رزرو شده است");
      }
      throw err;
    }
  }

  async list(userId: string, role: "CUSTOMER" | "PROFESSIONAL") {
    if (role === "PROFESSIONAL") {
      const pro = await this.prisma.professional.findUnique({
        where: { userId },
      });
      if (!pro) return [];
      return this.prisma.booking.findMany({
        where: { professionalId: pro.id },
        include: bookingInclude,
        orderBy: { startsAt: "desc" },
      });
    }
    return this.prisma.booking.findMany({
      where: { customerId: userId },
      include: bookingInclude,
      orderBy: { startsAt: "desc" },
    });
  }

  async get(userId: string, role: "CUSTOMER" | "PROFESSIONAL", id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException("رزرو پیدا نشد");
    await this.assertAccess(userId, role, booking);
    return booking;
  }

  async cancel(userId: string, role: "CUSTOMER" | "PROFESSIONAL", id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("رزرو پیدا نشد");
    await this.assertAccess(userId, role, booking);
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException("رزرو قبلاً لغو شده است");
    }
    if (booking.startsAt <= new Date()) {
      throw new BadRequestException("رزرو شروع‌شده را نمی‌توان لغو کرد");
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: bookingInclude,
    });
  }

  private async assertAccess(
    userId: string,
    role: "CUSTOMER" | "PROFESSIONAL",
    booking: { customerId: string; professionalId: string },
  ) {
    if (role === "CUSTOMER" && booking.customerId === userId) return;
    if (role === "PROFESSIONAL") {
      const pro = await this.prisma.professional.findUnique({
        where: { userId },
      });
      if (pro && pro.id === booking.professionalId) return;
    }
    throw new ForbiddenException("دسترسی مجاز نیست");
  }
}

const bookingInclude = {
  service: true,
  business: { select: { id: true, name: true, address: true } },
  professional: { include: { user: { select: { name: true } } } },
  customer: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.BookingInclude;

function isOverlapError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("23P01") || msg.includes("Booking_no_overlap");
}
