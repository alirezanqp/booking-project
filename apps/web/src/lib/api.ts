const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiError = { message: string; status: number };

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = "خطایی رخ داد";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join("، ");
      else if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw { message, status: res.status } satisfies ApiError;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type Me = {
  id: string;
  phone: string;
  name: string | null;
  role: "CUSTOMER" | "PROFESSIONAL";
  professional: {
    id: string;
    businessId: string;
    businessName?: string;
  } | null;
};

export type Business = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  services?: Service[];
  professionals?: Professional[];
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  priceIrr: number;
  durationMin: number;
  active: boolean;
};

export type Professional = {
  id: string;
  isOwner: boolean;
  user: { id?: string; name: string | null; phone?: string };
  workingHours?: WorkingHour[];
};

export type WorkingHour = {
  id?: string;
  weekday: number;
  startMin: number;
  endMin: number;
};

export type Slot = { professionalId: string; startsAt: string };

export type Booking = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  priceIrr: number;
  service: Service;
  business: { id: string; name: string; address: string | null };
  professional: { user: { name: string | null } };
  customer?: { id: string; name: string | null; phone: string };
};
