import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q?: string, category?: string, city?: string) {
    return this.prisma.business.findMany({
      where: {
        AND: [
          city ? { city: { contains: city, mode: "insensitive" } } : {},
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  {
                    professionals: {
                      some: { user: { name: { contains: q, mode: "insensitive" } } },
                    },
                  },
                  {
                    services: {
                      some: { name: { contains: q, mode: "insensitive" }, active: true },
                    },
                  },
                ],
              }
            : {},
          category
            ? { services: { some: { category: category as never, active: true } } }
            : {},
        ],
      },
      include: {
        services: { where: { active: true }, take: 4 },
        professionals: { include: { user: { select: { name: true } } } },
      },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        services: { where: { active: true }, orderBy: { name: "asc" } },
        professionals: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
            workingHours: { orderBy: { weekday: "asc" } },
          },
        },
      },
    });
    if (!business) throw new NotFoundException("کسب‌وکار پیدا نشد");
    return business;
  }

  async update(userId: string, id: string, data: {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    logoUrl?: string;
    coverUrl?: string;
  }) {
    await this.assertOwner(userId, id);
    return this.prisma.business.update({ where: { id }, data });
  }

  async assertOwner(userId: string, businessId: string) {
    const pro = await this.prisma.professional.findUnique({
      where: { userId },
    });
    if (!pro || pro.businessId !== businessId || !pro.isOwner) {
      throw new ForbiddenException("دسترسی مجاز نیست");
    }
    return pro;
  }

  async requireProfessional(userId: string) {
    const pro = await this.prisma.professional.findUnique({
      where: { userId },
    });
    if (!pro) throw new ForbiddenException("حساب حرفه‌ای نیست");
    return pro;
  }
}
