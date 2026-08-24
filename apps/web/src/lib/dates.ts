const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000;
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function formatToman(irr: number): string {
  return `${toFaDigits(irr.toLocaleString("en-US"))} تومان`;
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

export function nextDays(count: number): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const iso = tehranYmd(d);
    out.push({ iso, label: faLongDate(d) });
  }
  return out;
}

export const WEEKDAY_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

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
