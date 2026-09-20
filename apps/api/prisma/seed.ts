import { PrismaClient, ServiceCategory, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const SAT_TO_WED = [6, 0, 1, 2, 3]; // Sat–Wed
const THU = 4;

type SeedService = {
  name: string;
  category: ServiceCategory;
  priceIrr: number;
  durationMin: number;
};

type SeedBusiness = {
  ownerPhone: string;
  ownerName: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  logoUrl?: string;
  coverUrl?: string;
  services: SeedService[];
};

const BUSINESSES: SeedBusiness[] = [
  {
    ownerPhone: "09121111111",
    ownerName: "علی رضایی",
    name: "آرایشگاه مردانه نوید",
    description:
      "کوتاهی مدرن، اصلاح ریش و استایل مو با محصولات باکیفیت در قلب ونک.",
    address: "تهران، ونک، خیابان ملاصدرا، پلاک ۱۲",
    city: "تهران",
    phone: "02186001234",
    logoUrl: "/salons/navid-logo.svg",
    coverUrl: "/salons/navid-cover.svg",
    services: [
      { name: "کوتاهی مو آقایان", category: "HAIRCUT", priceIrr: 350000, durationMin: 30 },
      { name: "اصلاح ریش", category: "BEARD", priceIrr: 220000, durationMin: 20 },
      { name: "استایل مو", category: "STYLING", priceIrr: 480000, durationMin: 45 },
    ],
  },
  {
    ownerPhone: "09122222222",
    ownerName: "سارا محمدی",
    name: "سالن زیبایی گل‌گندم",
    description:
      "رنگ‌گذاری تخصصی، کوتاهی بانوان و آرایش عروس با تیم مجرب.",
    address: "تهران، سعادت‌آباد، میدان کاج، خیابان سرو شرقی",
    city: "تهران",
    phone: "02122114567",
    coverUrl: "/salons/golgandom-cover.svg",
    services: [
      { name: "کوتاهی مو بانوان", category: "HAIRCUT", priceIrr: 550000, durationMin: 45 },
      { name: "رنگ مو کامل", category: "HAIR_COLORING", priceIrr: 1800000, durationMin: 120 },
      { name: "آرایش صورت", category: "MAKEUP", priceIrr: 950000, durationMin: 60 },
      { name: "کراتین و ترمیم", category: "HAIR_TREATMENT", priceIrr: 2500000, durationMin: 150 },
    ],
  },
  {
    ownerPhone: "09123334445",
    ownerName: "مهسا کریمی",
    name: "سالن زیبایی آترینا",
    description: "میکاپ تخصصی، شینیون و خدمات ناخن در محیطی آرام و لوکس.",
    address: "تهران، جردن، خیابان ولیعصر، بالاتر از پارک وی",
    city: "تهران",
    phone: "02122008901",
    services: [
      { name: "میکاپ روزانه", category: "MAKEUP", priceIrr: 700000, durationMin: 45 },
      { name: "میکاپ عروس", category: "MAKEUP", priceIrr: 3500000, durationMin: 120 },
      { name: "مانیکور ژل", category: "NAILS", priceIrr: 650000, durationMin: 60 },
      { name: "کوتاهی و براشینگ", category: "HAIRCUT", priceIrr: 600000, durationMin: 50 },
    ],
  },
  {
    ownerPhone: "09124445556",
    ownerName: "رضا احمدی",
    name: "باربرشاپ کلاسیک پارس",
    description: "اصلاح سنتی و کوتاهی کلاسیک آقایان با تیغ و حوله گرم.",
    address: "تهران، تجریش، خیابان شهرداری، کوچه تختی",
    city: "تهران",
    phone: "02122703456",
    services: [
      { name: "کوتاهی کلاسیک", category: "HAIRCUT", priceIrr: 400000, durationMin: 35 },
      { name: "اصلاح با تیغ", category: "BEARD", priceIrr: 280000, durationMin: 25 },
      { name: "پکیج کامل", category: "STYLING", priceIrr: 650000, durationMin: 55 },
    ],
  },
  {
    ownerPhone: "09125556667",
    ownerName: "نازنین حسینی",
    name: "کلینیک پوست و زیبایی ویرا",
    description: "پاکسازی پوست، فیشال تخصصی و مراقبت پوست صورت.",
    address: "تهران، الهیه، خیابان فرشته، پلاک ۸",
    city: "تهران",
    phone: "02122607890",
    services: [
      { name: "پاکسازی پوست عمیق", category: "SKIN_CARE", priceIrr: 1200000, durationMin: 75 },
      { name: "فیشال هیدرا", category: "SKIN_CARE", priceIrr: 1500000, durationMin: 90 },
      { name: "ماسک تخصصی", category: "SKIN_CARE", priceIrr: 850000, durationMin: 45 },
    ],
  },
  {
    ownerPhone: "09126667778",
    ownerName: "فاطمه نوری",
    name: "استودیو ناخن لونا",
    description: "طراحی ناخن، کاشت و ترمیم با متریال وارداتی.",
    address: "تهران، پونک، بلوار سیمون بولیوار، مجتمع سرو",
    city: "تهران",
    phone: "02144451230",
    services: [
      { name: "کاشت ناخن پودری", category: "NAILS", priceIrr: 1100000, durationMin: 90 },
      { name: "ترمیم ناخن", category: "NAILS", priceIrr: 700000, durationMin: 60 },
      { name: "پدیکور لوکس", category: "NAILS", priceIrr: 550000, durationMin: 50 },
    ],
  },
  {
    ownerPhone: "09127778889",
    ownerName: "امیر حسینی",
    name: "آرایشگاه آقایان رایان",
    description: "کوتاهی فید، رنگ مو آقایان و استایل روز.",
    address: "تهران، یوسف‌آباد، خیابان فتحی شقاقی",
    city: "تهران",
    phone: "02188014567",
    services: [
      { name: "کوتاهی فید", category: "HAIRCUT", priceIrr: 380000, durationMin: 30 },
      { name: "رنگ مو آقایان", category: "HAIR_COLORING", priceIrr: 900000, durationMin: 60 },
      { name: "استایل و براش", category: "STYLING", priceIrr: 320000, durationMin: 25 },
    ],
  },
  {
    ownerPhone: "09128889990",
    ownerName: "مریم اکبری",
    name: "سالن زیبایی نیلوفر آبی",
    description: "رنگ‌گذاری بالیاژ، هایلایت و کوتاهی تخصصی بانوان.",
    address: "تهران، نیاوران، خیابان باهنر، نبش کوچه دل‌آرا",
    city: "تهران",
    phone: "02122290123",
    services: [
      { name: "بالیاژ", category: "HAIR_COLORING", priceIrr: 2200000, durationMin: 150 },
      { name: "کوتاهی لایه‌ای", category: "HAIRCUT", priceIrr: 650000, durationMin: 50 },
      { name: "درمان مو آسیب‌دیده", category: "HAIR_TREATMENT", priceIrr: 1800000, durationMin: 100 },
    ],
  },
  {
    ownerPhone: "09120011223",
    ownerName: "حسین مرادی",
    name: "باربرشاپ مدرن اکتاو",
    description: "فضای مدرن، کوتاهی و اصلاح همزمان با موسیقی زنده آخر هفته.",
    address: "تهران، شهرک غرب، فاز ۲، خیابان سیمای ایران",
    city: "تهران",
    phone: "02188567890",
    services: [
      { name: "کوتاهی مدرن", category: "HAIRCUT", priceIrr: 420000, durationMin: 35 },
      { name: "ریش و سبیل", category: "BEARD", priceIrr: 250000, durationMin: 20 },
      { name: "واکس و استایل", category: "STYLING", priceIrr: 300000, durationMin: 20 },
    ],
  },
  {
    ownerPhone: "09120122334",
    ownerName: "الهام صادقی",
    name: "سالن زیبایی روژا",
    description: "آرایش عروس، شینیون و میکاپ تخصصی در قیطریه.",
    address: "تهران، قیطریه، خیابان شهید اکبری",
    city: "تهران",
    phone: "02122223456",
    services: [
      { name: "میکاپ عروس", category: "MAKEUP", priceIrr: 4200000, durationMin: 130 },
      { name: "شینیون", category: "STYLING", priceIrr: 1500000, durationMin: 75 },
      { name: "کوتاهی مو", category: "HAIRCUT", priceIrr: 500000, durationMin: 40 },
    ],
  },
  {
    ownerPhone: "09120233445",
    ownerName: "کامران جعفری",
    name: "آرایشگاه مردانه ستاره",
    description: "خدمات آقایان با قیمت مناسب در مرکز شهر.",
    address: "تهران، انقلاب، خیابان وصال شیرازی",
    city: "تهران",
    phone: "02166441234",
    services: [
      { name: "کوتاهی مو", category: "HAIRCUT", priceIrr: 250000, durationMin: 25 },
      { name: "اصلاح صورت", category: "BEARD", priceIrr: 150000, durationMin: 15 },
    ],
  },
  {
    ownerPhone: "09120344556",
    ownerName: "شیما رستمی",
    name: "سالن زیبایی بهارنارنج",
    description: "رنگ، کوتاهی و مراقبت پوست در محیط خانوادگی.",
    address: "کرج، گوهردشت، بلوار مطهری، نبش خیابان ۱۳",
    city: "کرج",
    phone: "02634215678",
    services: [
      { name: "کوتاهی بانوان", category: "HAIRCUT", priceIrr: 400000, durationMin: 40 },
      { name: "رنگ ریشه", category: "HAIR_COLORING", priceIrr: 950000, durationMin: 75 },
      { name: "پاکسازی پوست", category: "SKIN_CARE", priceIrr: 700000, durationMin: 60 },
      { name: "مانیکور ساده", category: "NAILS", priceIrr: 350000, durationMin: 40 },
    ],
  },
  {
    ownerPhone: "09120455667",
    ownerName: "پویا کاظمی",
    name: "باربرشاپ اصفهان گلدن",
    description: "کوتاهی و استایل آقایان نزدیک سی‌وسه‌پل.",
    address: "اصفهان، خیابان چهارباغ عباسی، کوچه پشت مطبخ",
    city: "اصفهان",
    phone: "03132219876",
    services: [
      { name: "کوتاهی مو", category: "HAIRCUT", priceIrr: 280000, durationMin: 30 },
      { name: "اصلاح ریش", category: "BEARD", priceIrr: 180000, durationMin: 20 },
      { name: "رنگ مو", category: "HAIR_COLORING", priceIrr: 750000, durationMin: 50 },
    ],
  },
  {
    ownerPhone: "09120566778",
    ownerName: "زهرا موسوی",
    name: "سالن زیبایی شیراز گلستان",
    description: "خدمات کامل زیبایی بانوان در خیابان زند.",
    address: "شیراز، خیابان زند، روبروی سینما سعدی",
    city: "شیراز",
    phone: "07132304567",
    services: [
      { name: "کوتاهی و استایل", category: "HAIRCUT", priceIrr: 480000, durationMin: 45 },
      { name: "رنگ مو کامل", category: "HAIR_COLORING", priceIrr: 1400000, durationMin: 110 },
      { name: "میکاپ مهمانی", category: "MAKEUP", priceIrr: 850000, durationMin: 55 },
      { name: "کراتین برزیلی", category: "HAIR_TREATMENT", priceIrr: 2800000, durationMin: 160 },
    ],
  },
  {
    ownerPhone: "09120677889",
    ownerName: "مجید شریفی",
    name: "آرایشگاه مشهد بارون",
    description: "کوتاهی آقایان و خدمات ریش نزدیک حرم.",
    address: "مشهد، خیابان امام رضا، بین امام رضا ۱۴ و ۱۶",
    city: "مشهد",
    phone: "05138501234",
    services: [
      { name: "کوتاهی مو", category: "HAIRCUT", priceIrr: 300000, durationMin: 30 },
      { name: "اصلاح ریش", category: "BEARD", priceIrr: 200000, durationMin: 20 },
      { name: "استایل مو", category: "STYLING", priceIrr: 350000, durationMin: 30 },
    ],
  },
  {
    ownerPhone: "09120788990",
    ownerName: "یاسمن فرهادی",
    name: "استودیو زیبایی مروا",
    description: "ناخن، میکاپ و مراقبت پوست تخصصی در پاسداران.",
    address: "تهران، پاسداران، بوستان نهم، پلاک ۲۱",
    city: "تهران",
    phone: "02122556789",
    services: [
      { name: "کاشت ناخن ژل", category: "NAILS", priceIrr: 980000, durationMin: 80 },
      { name: "میکاپ اسموکی", category: "MAKEUP", priceIrr: 780000, durationMin: 50 },
      { name: "فیشال طلا", category: "SKIN_CARE", priceIrr: 1600000, durationMin: 85 },
    ],
  },
  {
    ownerPhone: "09120899001",
    ownerName: "آرمان نیک‌پور",
    name: "کلاب آقایان لومیر",
    description: "باربرشاپ پریمیوم با خدمات VIP و ماساژ سر.",
    address: "تهران، زعفرانیه، خیابان مقدس اردبیلی",
    city: "تهران",
    phone: "02122445678",
    services: [
      { name: "کوتاهی VIP", category: "HAIRCUT", priceIrr: 750000, durationMin: 45 },
      { name: "اصلاح لوکس", category: "BEARD", priceIrr: 450000, durationMin: 30 },
      { name: "استایل و مراقبت مو", category: "STYLING", priceIrr: 550000, durationMin: 40 },
      { name: "رنگ مو تخصصی", category: "HAIR_COLORING", priceIrr: 1200000, durationMin: 70 },
    ],
  },
  {
    ownerPhone: "09120900112",
    ownerName: "نگین طاهری",
    name: "سالن زیبایی سپیدار",
    description: "کوتاهی کودک و بانوان، رنگ و ترمیم مو در سعادت‌آباد.",
    address: "تهران، سعادت‌آباد، میدان کتاب، خیابان ۲۴ متری",
    city: "تهران",
    phone: "02122119876",
    services: [
      { name: "کوتاهی بانوان", category: "HAIRCUT", priceIrr: 520000, durationMin: 40 },
      { name: "کوتاهی کودک", category: "HAIRCUT", priceIrr: 280000, durationMin: 25 },
      { name: "هایلایت", category: "HAIR_COLORING", priceIrr: 1600000, durationMin: 120 },
      { name: "بوتاکس مو", category: "HAIR_TREATMENT", priceIrr: 2000000, durationMin: 110 },
    ],
  },
  {
    ownerPhone: "09121011223",
    ownerName: "سعید قاسمی",
    name: "آرایشگاه مردانه البرز",
    description: "کوتاهی سریع و باکیفیت برای آقایان در کرج.",
    address: "کرج، عظیمیه، بلوار امام خمینی، پاساژ الماس",
    city: "کرج",
    phone: "02632567890",
    services: [
      { name: "کوتاهی مو", category: "HAIRCUT", priceIrr: 270000, durationMin: 25 },
      { name: "اصلاح ریش", category: "BEARD", priceIrr: 160000, durationMin: 15 },
      { name: "استایل مو", category: "STYLING", priceIrr: 220000, durationMin: 20 },
    ],
  },
  {
    ownerPhone: "09121122334",
    ownerName: "پریسا احمدی",
    name: "سالن زیبایی ارکیده اصفهان",
    description: "میکاپ، ناخن و رنگ مو در چهارباغ بالا.",
    address: "اصفهان، چهارباغ بالا، خیابان شیخ صدوق",
    city: "اصفهان",
    phone: "03136223456",
    services: [
      { name: "میکاپ تخصصی", category: "MAKEUP", priceIrr: 900000, durationMin: 60 },
      { name: "مانیکور ژلیش", category: "NAILS", priceIrr: 580000, durationMin: 55 },
      { name: "رنگ مو", category: "HAIR_COLORING", priceIrr: 1300000, durationMin: 100 },
      { name: "کوتاهی مو", category: "HAIRCUT", priceIrr: 450000, durationMin: 40 },
    ],
  },
];

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

  await prisma.user.create({
    data: { phone: "09120000000", name: "مشتری نمونه", role: UserRole.CUSTOMER },
  });

  const createdIds: string[] = [];

  for (const item of BUSINESSES) {
    const owner = await prisma.user.create({
      data: {
        phone: item.ownerPhone,
        name: item.ownerName,
        role: UserRole.PROFESSIONAL,
      },
    });

    const business = await prisma.business.create({
      data: {
        name: item.name,
        description: item.description,
        address: item.address,
        city: item.city,
        phone: item.phone,
        logoUrl: item.logoUrl,
        coverUrl: item.coverUrl,
        services: {
          create: item.services.map((s) => ({
            name: s.name,
            category: s.category,
            priceIrr: s.priceIrr,
            durationMin: s.durationMin,
          })),
        },
      },
    });

    const pro = await prisma.professional.create({
      data: {
        userId: owner.id,
        businessId: business.id,
        isOwner: true,
      },
    });

    await hoursFor(pro.id);
    createdIds.push(business.id);
  }

  console.log("seeded", {
    businesses: createdIds.length,
    customer: "09120000000",
    sampleOwners: ["09121111111", "09122222222"],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
