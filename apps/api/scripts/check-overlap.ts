/**
 * Overlap self-check (app-level): after booking a slot, that window must not stay free.
 * Requires DB schema + seed. Does not rely on a PG exclusion migration.
 */
import { PrismaClient, BookingStatus } from "@prisma/client";
import { overlaps } from "../src/availability/time";

const prisma = new PrismaClient();

async function main() {
  const service = await prisma.service.findFirst({
    where: { durationMin: 30, active: true },
    include: { business: { include: { professionals: true } } },
  });
  if (!service?.business.professionals[0]) throw new Error("seed first");
  const professionalId = service.business.professionals[0].id;
  const customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  if (!customer) throw new Error("need customer");

  const startsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  startsAt.setMinutes(0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);

  await prisma.booking.deleteMany({ where: { professionalId, startsAt } });

  const first = await prisma.booking.create({
    data: {
      customerId: customer.id,
      professionalId,
      businessId: service.businessId,
      serviceId: service.id,
      startsAt,
      endsAt,
      status: BookingStatus.CONFIRMED,
      priceIrr: service.priceIrr,
    },
  });

  const midStart = new Date(startsAt.getTime() + 10 * 60 * 1000);
  const midEnd = new Date(endsAt.getTime() + 10 * 60 * 1000);
  const clash = await prisma.booking.findFirst({
    where: {
      professionalId,
      status: { not: BookingStatus.CANCELLED },
      startsAt: { lt: midEnd },
      endsAt: { gt: midStart },
    },
  });

  await prisma.booking.delete({ where: { id: first.id } });

  if (!clash || !overlaps(startsAt, endsAt, midStart, midEnd)) {
    throw new Error("overlap detection failed");
  }
  console.log("ok: overlapping window detected against existing booking");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
