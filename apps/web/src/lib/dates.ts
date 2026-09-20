const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000;
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function formatToman(irr: number): string {
  return `${toFaDigits(irr.toLocaleString("en-US"))} تومان`;
}

export function formatDuration(minutes: number): string {
  return `${toFaDigits(minutes)} دقیقه`;
}

export function tehranYmd(d: Date): string {
  const t = new Date(d.getTime() + TEHRAN_OFFSET_MS);
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  const day = String(t.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function faLongDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Tehran",
  }).format(d);
}

export function faTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tehran",
  }).format(d);
}

export type DayChip = {
  iso: string;
  weekday: string;
  day: string;
  label: string;
};

export function nextDays(count: number): DayChip[] {
  const out: DayChip[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const iso = tehranYmd(d);
    const weekday = new Intl.DateTimeFormat("fa-IR", {
      weekday: "short",
      timeZone: "Asia/Tehran",
    }).format(d);
    const day = new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      timeZone: "Asia/Tehran",
    }).format(d);
    out.push({ iso, weekday, day, label: faLongDate(d) });
  }
  return out;
}

/** JS getDay() labels: 0=Sun … 6=Sat */
export const WEEKDAY_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/** Iran week: Sat → Fri */
export const WEEKDAY_ORDER_IR = [6, 0, 1, 2, 3, 4, 5];

export function minutesToHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return toFaDigits(
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  );
}

export const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار",
  CONFIRMED: "تأیید شده",
  CANCELLED: "لغو شده",
  COMPLETED: "انجام شده",
  NO_SHOW: "عدم حضور",
};

export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url;
}
