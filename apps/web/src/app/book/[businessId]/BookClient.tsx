"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  api,
  type Business,
  type Me,
  type Service,
  type Slot,
} from "@/lib/api";
import { faLongDate, faTime, formatToman, nextDays } from "@/lib/dates";

type Step = "service" | "pro" | "date" | "time" | "confirm" | "done";

export default function BookClient() {
  const { businessId } = useParams<{ businessId: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [serviceId, setServiceId] = useState(search.get("serviceId") ?? "");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [step, setStep] = useState<Step>(
    search.get("serviceId") ? "pro" : "service",
  );

  const days = useMemo(() => nextDays(14), []);
  const services = business?.services ?? [];
  const professionals = business?.professionals ?? [];
  const service = services.find((s) => s.id === serviceId);
  const activeProId =
    professionalId || (professionals.length === 1 ? professionals[0].id : "");

  useEffect(() => {
    api<Business>(`/businesses/${businessId}`).then((b) => {
      setBusiness(b);
      if (b.professionals?.length === 1) {
        setProfessionalId(b.professionals[0].id);
        if (search.get("serviceId")) setStep("date");
      }
    });
    api<Me>("/me")
      .then((u) => {
        setMe(u);
        setName(u.name ?? "");
      })
      .catch(() => setMe(null));
  }, [businessId, search]);

  useEffect(() => {
    if (!serviceId || !date || !activeProId) return;
    const qs = new URLSearchParams({
      serviceId,
      date,
      professionalId: activeProId,
    });
    api<Slot[]>(`/businesses/${businessId}/available-slots?${qs}`)
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [businessId, serviceId, date, activeProId]);

  async function confirm() {
    setError("");
    if (!me) {
      router.push(
        `/login?next=${encodeURIComponent(`/book/${businessId}?serviceId=${serviceId}`)}`,
      );
      return;
    }
    if (!slot || !service) return;
    setLoading(true);
    try {
      if (name.trim() && name !== me.name) {
        await api("/me", {
          method: "PATCH",
          body: JSON.stringify({ name: name.trim() }),
        });
      }
      const booking = await api<{ id: string }>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          businessId,
          serviceId,
          professionalId: slot.professionalId,
          startsAt: slot.startsAt,
        }),
      });
      setBookingId(booking.id);
      setStep("done");
    } catch (err) {
      setError((err as { message: string }).message);
    } finally {
      setLoading(false);
    }
  }

  if (!business) {
    return <p className="text-muted">در حال بارگذاری...</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm text-muted">{business.name}</p>
        <h1 className="text-2xl font-bold">رزرو نوبت</h1>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {step === "service" && (
        <StepCard title="انتخاب خدمت">
          {services.map((s) => (
            <Choice
              key={s.id}
              title={s.name}
              subtitle={`${s.durationMin} دقیقه · ${formatToman(s.priceIrr)}`}
              onClick={() => {
                setServiceId(s.id);
                setStep(professionals.length > 1 ? "pro" : "date");
              }}
            />
          ))}
        </StepCard>
      )}

      {step === "pro" && (
        <StepCard title="انتخاب متخصص" onBack={() => setStep("service")}>
          {professionals.map((p) => (
            <Choice
              key={p.id}
              title={p.user.name || "متخصص"}
              onClick={() => {
                setProfessionalId(p.id);
                setStep("date");
              }}
            />
          ))}
        </StepCard>
      )}

      {step === "date" && (
        <StepCard
          title="انتخاب تاریخ"
          onBack={() => setStep(professionals.length > 1 ? "pro" : "service")}
        >
          <div className="grid gap-2">
            {days.map((d) => (
              <Choice
                key={d.iso}
                title={d.label}
                onClick={() => {
                  setDate(d.iso);
                  setSlot(null);
                  setStep("time");
                }}
              />
            ))}
          </div>
        </StepCard>
      )}

      {step === "time" && (
        <StepCard title="انتخاب ساعت" onBack={() => setStep("date")}>
          {slots.length === 0 ? (
            <p className="text-sm text-muted">ساعت آزادی برای این روز نیست.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s.startsAt}
                  type="button"
                  className="rounded-2xl border border-border px-3 py-3 text-sm hover:border-brand"
                  onClick={() => {
                    setSlot(s);
                    setStep("confirm");
                  }}
                >
                  {faTime(s.startsAt)}
                </button>
              ))}
            </div>
          )}
        </StepCard>
      )}

      {step === "confirm" && service && slot && (
        <StepCard title="تأیید رزرو" onBack={() => setStep("time")}>
          <Summary service={service} business={business} slot={slot} />
          <label className="mt-4 block text-sm">
            نام
            <input
              className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <p className="mt-2 text-sm text-muted" dir="ltr">
            {me?.phone ?? "برای ادامه وارد شوید"}
          </p>
          <button
            disabled={loading}
            onClick={confirm}
            className="mt-4 w-full rounded-full bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {me ? "ثبت نوبت" : "ورود و ثبت نوبت"}
          </button>
        </StepCard>
      )}

      {step === "done" && (
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-brand">نوبت ثبت شد</h2>
          <p className="mb-6 text-muted">رزرو شما با موفقیت تأیید شد.</p>
          <Link
            href="/me/bookings"
            className="rounded-full bg-brand px-6 py-3 text-white"
          >
            مشاهده نوبت‌ها
          </Link>
          {bookingId && (
            <p className="mt-4 text-xs text-muted" dir="ltr">
              {bookingId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StepCard({
  title,
  children,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-muted">
            بازگشت
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Choice({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col rounded-2xl border border-border px-4 py-3 text-right hover:border-brand"
    >
      <span className="font-medium">{title}</span>
      {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
    </button>
  );
}

function Summary({
  service,
  business,
  slot,
}: {
  service: Service;
  business: Business;
  slot: Slot;
}) {
  return (
    <ul className="space-y-2 text-sm">
      <li className="flex justify-between">
        <span className="text-muted">سالن</span>
        <span>{business.name}</span>
      </li>
      <li className="flex justify-between">
        <span className="text-muted">خدمت</span>
        <span>{service.name}</span>
      </li>
      <li className="flex justify-between">
        <span className="text-muted">تاریخ</span>
        <span>{faLongDate(slot.startsAt)}</span>
      </li>
      <li className="flex justify-between">
        <span className="text-muted">ساعت</span>
        <span>{faTime(slot.startsAt)}</span>
      </li>
      <li className="flex justify-between font-bold">
        <span>قیمت</span>
        <span className="text-brand">{formatToman(service.priceIrr)}</span>
      </li>
    </ul>
  );
}
