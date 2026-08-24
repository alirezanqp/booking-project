"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Booking } from "@/lib/api";
import { faLongDate, faTime, formatToman, STATUS_FA } from "@/lib/dates";

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setBookings(await api<Booking[]>("/bookings"));
    } catch {
      router.push("/login?next=/me/bookings");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancel(id: string) {
    setError("");
    try {
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError((err as { message: string }).message);
    }
  }

  const upcoming = bookings.filter(
    (b) => b.status !== "CANCELLED" && new Date(b.startsAt) > new Date(),
  );
  const history = bookings.filter(
    (b) => b.status === "CANCELLED" || new Date(b.startsAt) <= new Date(),
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">نوبت‌های من</h1>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <section>
        <h2 className="mb-3 font-bold">آینده</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted">
            نوبتی ندارید.{" "}
            <Link href="/search" className="text-brand">
              جستجو کنید
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={() => cancel(b.id)} />
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-bold">تاریخچه</h2>
        {history.length === 0 ? (
          <p className="text-muted">خالی است.</p>
        ) : (
          <div className="space-y-3">
            {history.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{booking.business.name}</p>
          <p className="text-sm text-muted">{booking.service.name}</p>
          <p className="mt-1 text-sm">
            {faLongDate(booking.startsAt)} · {faTime(booking.startsAt)}
          </p>
          <p className="text-sm text-brand">{formatToman(booking.priceIrr)}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs text-brand">
          {STATUS_FA[booking.status] ?? booking.status}
        </span>
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 text-sm text-danger"
        >
          لغو نوبت
        </button>
      )}
    </div>
  );
}
