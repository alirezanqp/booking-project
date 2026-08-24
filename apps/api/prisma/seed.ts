import { PrismaClient, ServiceCategory, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const SAT_TO_WED = [6, 0, 1, 2, 3]; // Sat–Wed 09:00–18:00
const THU = 4; // 09:00–14:00

async function hoursFor(professionalId: string) {
  const rows = [
    ...SAT_TO_WED.map((weekday) => ({
      professionalId,
      weekday,
      startMin: 9 * 60,
      endMin: 18 * 60,
    })),
    { professionalId, weekday: THU, startMin: 9 * 60, endMin: 14 * 60 },
  ];
  await prisma.workingHour.createMany({ data: rows });
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.workingHour.deleteMany();
  await prisma.service.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const owner1 = await prisma.user.create({
    data: {
      phone: "09121111111",
      name: "علی رضایی",
      role: UserRole.PROFESSIONAL,
    },
  });
  const owner2 = await prisma.user.create({
    data: {
      phone: "09122222222",
      name: "سارا محمدی",
      role: UserRole.PROFESSIONAL,
    },
  });
  await prisma.user.create({
    data: { phone: "09120000000", name: "مشتری نمونه", role: UserRole.CUSTOMER },
  });

  const barber = await prisma.business.create({
    data: {
      name: "آرایشگاه مردانه نوید",
      description: "کوتاهی، اصلاح و استایل مردانه در ونک",
      address: "تهران، ونک، خیابان ملاصدرا",
      city: "تهران",
      phone: "02188000000",
      logoUrl: "/salons/navid-logo.svg",
      coverUrl: "/salons/navid-cover.svg",
    },
  });
  const salon = await prisma.business.create({
    data: {
      name: "سالن زیبایی گل‌گندم",
      description: "رنگ، کوتاهی و خدمات زیبایی بانوان",
      address: "تهران، سعادت‌آباد",
      city: "تهران",
      phone: "02122000000",
      logoUrl: "/salons/golgandom-logo.svg",
      coverUrl: "/salons/golgandom-cover.svg",
    },
  });

  const pro1 = await prisma.professional.create({
    data: { userId: owner1.id, businessId: barber.id, isOwner: true },
  });
  const pro2 = await prisma.professional.create({
    data: { userId: owner2.id, businessId: salon.id, isOwner: true },
  });

  await hoursFor(pro1.id);
  await hoursFor(pro2.id);

  await prisma.service.createMany({
    data: [
      {
        businessId: barber.id,
        name: "کوتاهی مو آقایان",
        category: ServiceCategory.HAIRCUT,
        priceIrr: 300000,
        durationMin: 30,
      },
      {
        businessId: barber.id,
        name: "استایل مو",
        category: ServiceCategory.STYLING,
        priceIrr: 500000,
        durationMin: 45,
      },
      {
        businessId: barber.id,
        name: "اصلاح ریش",
        category: ServiceCategory.BEARD,
        priceIrr: 200000,
        durationMin: 20,
      },
      {
        businessId: salon.id,
        name: "کوتاهی مو",
        category: ServiceCategory.HAIRCUT,
        priceIrr: 450000,
        durationMin: 45,
      },
      {
        businessId: salon.id,
        name: "رنگ مو",
        category: ServiceCategory.HAIR_COLORING,
        priceIrr: 1200000,
        durationMin: 120,
      },
      {
        businessId: salon.id,
        name: "آرایش صورت",
        category: ServiceCategory.MAKEUP,
        priceIrr: 800000,
        durationMin: 60,
      },
    ],
  });

  console.log("seeded", { barber: barber.id, salon: salon.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
