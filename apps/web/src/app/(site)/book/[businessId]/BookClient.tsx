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
import {
  faLongDate,
  faTime,
  formatDuration,
  formatToman,
  nextDays,
} from "@/lib/dates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

type Step = "service" | "pro" | "date" | "time" | "confirm" | "done";

const STEP_LABELS: Record<Exclude<Step, "done" | "pro">, string> = {
  service: "خدمت",
  date: "تاریخ",
  time: "ساعت",
  confirm: "تأیید",
};

function inferStep(params: {
  serviceId: string;
  professionalId: string;
  date: string;
  startsAt: string;
  multiPro: boolean;
}): Step {
  if (!params.serviceId) return "service";
  if (params.multiPro && !params.professionalId) return "pro";
  if (!params.date) return "date";
  if (!params.startsAt) return "time";
  return "confirm";
}

export default function BookClient() {
  const { businessId } = useParams<{ businessId: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [serviceId, setServiceId] = useState(search.get("serviceId") ?? "");
  const [professionalId, setProfessionalId] = useState(
    search.get("professionalId") ?? "",
  );
  const [date, setDate] = useState(search.get("date") ?? "");
  const [slot, setSlot] = useState<Slot | null>(
    search.get("startsAt")
      ? {
          professionalId: search.get("professionalId") ?? "",
          startsAt: search.get("startsAt")!,
        }
      : null,
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [step, setStep] = useState<Step>("service");
  const [ready, setReady] = useState(false);

  const days = useMemo(() => nextDays(14), []);
  const services = business?.services ?? [];
  const professionals = business?.professionals ?? [];
  const service = services.find((s) => s.id === serviceId);
  const activeProId =
    professionalId || (professionals.length === 1 ? professionals[0].id : "");
  const multiPro = professionals.length > 1;

  const morning = slots.filter((s) => {
    const h = new Date(s.startsAt).getTime();
    const tehran = new Date(h + (3 * 60 + 30) * 60 * 1000);
    return tehran.getUTCHours() < 12;
  });
  const afternoon = slots.filter((s) => {
    const h = new Date(s.startsAt).getTime();
    const tehran = new Date(h + (3 * 60 + 30) * 60 * 1000);
    return tehran.getUTCHours() >= 12;
  });

  function writeBookUrl(parts: {
    serviceId?: string;
    professionalId?: string;
    date?: string;
    startsAt?: string;
  }) {
    const p = new URLSearchParams();
    if (parts.serviceId) p.set("serviceId", parts.serviceId);
    if (parts.professionalId) p.set("professionalId", parts.professionalId);
    if (parts.date) p.set("date", parts.date);
    if (parts.startsAt) p.set("startsAt", parts.startsAt);
    const qs = p.toString();
    const href = qs
      ? `/book/${businessId}?${qs}`
      : `/book/${businessId}`;
    // Soft URL update without remounting the client tree (App Router replace can drop params mid-wizard).
    window.history.replaceState(window.history.state, "", href);
  }

  function bookReturnUrl(extra?: {
    serviceId?: string;
    professionalId?: string;
    date?: string;
    startsAt?: string;
  }) {
    const p = new URLSearchParams();
    const sid = extra?.serviceId ?? serviceId;
    const pid = extra?.professionalId ?? activeProId;
    const d = extra?.date ?? date;
    const starts = extra?.startsAt ?? slot?.startsAt;
    if (sid) p.set("serviceId", sid);
    if (pid) p.set("professionalId", pid);
    if (d) p.set("date", d);
    if (starts) p.set("startsAt", starts);
    return `/book/${businessId}?${p.toString()}`;
  }

  useEffect(() => {
    let cancelled = false;
    api<Business>(`/businesses/${businessId}`).then((b) => {
      if (cancelled) return;
      setBusiness(b);
      const multi = (b.professionals?.length ?? 0) > 1;
      let pid = search.get("professionalId") ?? "";
      if (!pid && b.professionals?.length === 1) {
        pid = b.professionals[0].id;
      }
      if (pid) setProfessionalId(pid);
      const sid = search.get("serviceId") ?? serviceId;
      const d = search.get("date") ?? date;
      const startsAt = search.get("startsAt") ?? slot?.startsAt ?? "";
      if (sid) setServiceId(sid);
      if (d) setDate(d);
      if (startsAt) {
        setSlot({ professionalId: pid, startsAt });
      }
      setStep(
        inferStep({
          serviceId: sid,
          professionalId: pid,
          date: d,
          startsAt,
          multiPro: multi,
        }),
      );
      setReady(true);
    });
    api<Me>("/me")
      .then((u) => {
        if (cancelled) return;
        setMe(u);
        setName(u.name ?? "");
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  // Load once per business; URL is written by writeBookUrl for login return.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  useEffect(() => {
    if (!serviceId || !date || !activeProId) return;
    setSlotsLoading(true);
    const qs = new URLSearchParams({
      serviceId,
      date,
      professionalId: activeProId,
    });
    api<Slot[]>(`/businesses/${businessId}/available-slots?${qs}`)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [businessId, serviceId, date, activeProId]);

  async function confirm() {
    setError("");
    if (!me) {
      router.push(
        `/login?next=${encodeURIComponent(bookReturnUrl())}`,
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
          professionalId: slot.professionalId || activeProId,
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

  if (!business || !ready) {
    return (
      <div className="mx-auto max-w-lg space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const progressSteps = multiPro
    ? (["service", "pro", "date", "time", "confirm"] as const)
    : (["service", "date", "time", "confirm"] as const);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm text-muted">{business.name}</p>
        <h1 className="text-2xl font-bold">رزرو نوبت</h1>
      </div>

      {step !== "done" && (
        <div className="flex items-center gap-2">
          {progressSteps.map((s, i) => {
            const activeIdx = progressSteps.indexOf(
              step === "pro" ? "pro" : (step as (typeof progressSteps)[number]),
            );
            const done = i < activeIdx || step === "confirm" && s === "confirm";
            const current = s === step || (step === "pro" && s === "pro");
            return (
              <div key={s} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-1.5 w-full rounded-full ${
                    done || current ? "bg-brand" : "bg-border"
                  }`}
                />
                <span
                  className={`text-[10px] ${
                    current ? "font-bold text-brand" : "text-muted"
                  }`}
                >
                  {s === "pro"
                    ? "متخصص"
                    : STEP_LABELS[s as keyof typeof STEP_LABELS]}
                </span>
              </div>
            );
          })}
        </div>
      )}

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
              subtitle={`${formatDuration(s.durationMin)} · ${formatToman(s.priceIrr)}`}
              onClick={() => {
                setServiceId(s.id);
                setSlot(null);
                setDate("");
                writeBookUrl({
                  serviceId: s.id,
                  professionalId: activeProId,
                });
                setStep(multiPro ? "pro" : "date");
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
                writeBookUrl({
                  serviceId,
                  professionalId: p.id,
                });
                setStep("date");
              }}
            />
          ))}
        </StepCard>
      )}

      {step === "date" && (
        <StepCard
          title="انتخاب تاریخ"
          onBack={() => setStep(multiPro ? "pro" : "service")}
        >
          <div className="chip-scroll">
            {days.map((d) => {
              const selected = date === d.iso;
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    const iso = d.iso;
                    const pid = activeProId;
                    const sid = serviceId;
                    setDate(iso);
                    setSlot(null);
                    setSlots([]);
                    writeBookUrl({
                      serviceId: sid,
                      professionalId: pid,
                      date: iso,
                    });
                    setStep("time");
                  }}
                  className={`flex w-16 flex-col items-center rounded-2xl border px-2 py-3 ${
                    selected
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-card hover:border-brand"
                  }`}
                >
                  <span className="text-xs opacity-80">{d.weekday}</span>
                  <span className="text-lg font-bold">{d.day}</span>
                </button>
              );
            })}
          </div>
        </StepCard>
      )}

      {step === "time" && (
        <StepCard title="انتخاب ساعت" onBack={() => setStep("date")}>
          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <EmptyState
              title="ساعت آزادی نیست"
              description="روز دیگری را انتخاب کنید."
              action={
                <Button variant="outline" onClick={() => setStep("date")}>
                  تغییر تاریخ
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {morning.length > 0 && (
                <TimeGroup
                  title="صبح"
                  slots={morning}
                  onPick={(s) => {
                    setSlot({ ...s, professionalId: activeProId });
                    writeBookUrl({
                      serviceId,
                      professionalId: activeProId,
                      date,
                      startsAt: s.startsAt,
                    });
                    setStep("confirm");
                  }}
                />
              )}
              {afternoon.length > 0 && (
                <TimeGroup
                  title="بعدازظهر"
                  slots={afternoon}
                  onPick={(s) => {
                    setSlot({ ...s, professionalId: activeProId });
                    writeBookUrl({
                      serviceId,
                      professionalId: activeProId,
                      date,
                      startsAt: s.startsAt,
                    });
                    setStep("confirm");
                  }}
                />
              )}
            </div>
          )}
        </StepCard>
      )}

      {step === "confirm" && service && slot && (
        <StepCard title="تأیید رزرو" onBack={() => setStep("time")}>
          <Summary
            service={service}
            business={business}
            slot={slot}
            proName={
              professionals.find((p) => p.id === activeProId)?.user.name ?? null
            }
          />
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
          <Button
            disabled={loading}
            onClick={confirm}
            className="mt-4 w-full"
          >
            {me ? "ثبت نوبت" : "ورود و ثبت نوبت"}
          </Button>
        </StepCard>
      )}

      {step === "done" && (
        <Card className="text-center">
          <h2 className="mb-2 text-xl font-bold text-brand">نوبت ثبت شد</h2>
          <p className="mb-6 text-muted">رزرو شما با موفقیت تأیید شد.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/me/bookings"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 py-3 text-white"
            >
              نوبت‌های من
            </Link>
            <Link
              href={`/book/${businessId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 py-3"
            >
              رزرو دیگر
            </Link>
          </div>
          {bookingId && (
            <p className="mt-4 text-xs text-muted" dir="ltr">
              {bookingId}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

function TimeGroup({
  title,
  slots,
  onPick,
}: {
  title: string;
  slots: Slot[];
  onPick: (s: Slot) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => (
          <button
            key={s.startsAt}
            type="button"
            className="min-h-11 rounded-2xl border border-border px-3 py-3 text-sm hover:border-brand"
            onClick={() => onPick(s)}
          >
            {faTime(s.startsAt)}
          </button>
        ))}
      </div>
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
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-muted">
            بازگشت
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </Card>
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
      className="flex min-h-14 w-full flex-col rounded-2xl border border-border px-4 py-3 text-right hover:border-brand"
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
  proName,
}: {
  service: Service;
  business: Business;
  slot: Slot;
  proName: string | null;
}) {
  return (
    <ul className="space-y-2 text-sm">
      <li className="flex justify-between gap-3">
        <span className="text-muted">سالن</span>
        <span className="text-left">{business.name}</span>
      </li>
      <li className="flex justify-between gap-3">
        <span className="text-muted">خدمت</span>
        <span className="text-left">{service.name}</span>
      </li>
      {proName && (
        <li className="flex justify-between gap-3">
          <span className="text-muted">متخصص</span>
          <span className="text-left">{proName}</span>
        </li>
      )}
      <li className="flex justify-between gap-3">
        <span className="text-muted">تاریخ</span>
        <span className="text-left">{faLongDate(slot.startsAt)}</span>
      </li>
      <li className="flex justify-between gap-3">
        <span className="text-muted">ساعت</span>
        <span className="text-left">{faTime(slot.startsAt)}</span>
      </li>
      <li className="flex justify-between gap-3 font-bold">
        <span>قیمت</span>
        <span className="text-brand">{formatToman(service.priceIrr)}</span>
      </li>
    </ul>
  );
}
