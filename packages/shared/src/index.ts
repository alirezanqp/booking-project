export const USER_ROLES = ["CUSTOMER", "PROFESSIONAL"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SERVICE_CATEGORIES = [
  "HAIRCUT",
  "HAIR_COLORING",
  "BEARD",
  "STYLING",
  "MAKEUP",
  "NAILS",
  "SKIN_CARE",
  "HAIR_TREATMENT",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const CATEGORY_FA: Record<ServiceCategory, string> = {
  HAIRCUT: "کوتاهی مو",
  HAIR_COLORING: "رنگ مو",
  BEARD: "ریش",
  STYLING: "استایل",
  MAKEUP: "آرایش",
  NAILS: "ناخن",
  SKIN_CARE: "مراقبت پوست",
  HAIR_TREATMENT: "ترمیم مو",
};

export const TIMEZONE = "Asia/Tehran";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Stored integer is IRR; label تومان to match local UX. Amounts match the SRS table numbers. */
export function formatToman(irr: number): string {
  return `${toFaDigits(irr.toLocaleString("en-US"))} تومان`;
}
