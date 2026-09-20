"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Booking } from "@/lib/api";
import { faLongDate, faTime, formatToman, STATUS_FA } from "@/lib/dates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
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
    if (!confirm("نوبت لغو شود؟")) return;
    setError("");
    try {
      await api(`/bookings/${id}/cancel`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError((err as { message: string }).message);
    }
  }

  if (!bookings) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
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
          <EmptyState
            title="نوبت آینده‌ای ندارید"
            description="یک سالن انتخاب کنید و نوبت بگیرید."
            action={
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-white"
              >
                رزرو نوبت
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={() => cancel(b.id)}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-bold">تاریخچه</h2>
        {history.length === 0 ? (
          <EmptyState title="تاریخچه‌ای نیست" />
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
    <Card className="!p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{booking.business.name}</p>
          <p className="text-sm text-muted">{booking.service.name}</p>
          <p className="mt-1 text-sm">
            {faLongDate(booking.startsAt)} · {faTime(booking.startsAt)}
          </p>
          <p className="text-sm text-brand">
            {formatToman(booking.priceIrr)}
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs text-brand">
          {STATUS_FA[booking.status] ?? booking.status}
        </span>
      </div>
      {onCancel && (
        <Button
          type="button"
          variant="danger"
          className="mt-3 px-0"
          onClick={onCancel}
        >
          لغو نوبت
        </Button>
      )}
    </Card>
  );
}
