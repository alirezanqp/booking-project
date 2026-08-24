export const USER_ROLES = ["CUSTOMER", "PROFESSIONAL"] as const;
export type UserRole = (typeof USER_ROLES)[number];

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
