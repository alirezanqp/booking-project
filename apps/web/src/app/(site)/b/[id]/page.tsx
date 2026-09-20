import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_FA, type ServiceCategory } from "@booking/shared";
import { api, type Business } from "@/lib/api";
import {
  formatDuration,
  formatToman,
  mediaUrl,
  minutesToHm,
  WEEKDAY_FA,
  WEEKDAY_ORDER_IR,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let business: Business;
  try {
    business = await api<Business>(`/businesses/${id}`);
  } catch {
    notFound();
  }

  const pro = business.professionals?.[0];
  const hours = pro?.workingHours ?? [];
  const services = business.services ?? [];
  const minPrice = services.length
    ? Math.min(...services.map((s) => s.priceIrr))
    : null;
  const cover = mediaUrl(business.coverUrl);
  const logo = mediaUrl(business.logoUrl);

  return (
    <div className="space-y-8 pb-28 md:pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card">
        <div className="relative h-40 bg-gradient-to-l from-teal-100 to-amber-50 md:h-52">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="relative space-y-3 px-6 pb-6 pt-10">
          <div className="absolute -top-8 right-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-white text-2xl font-bold text-brand shadow">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              business.name.slice(0, 1)
            )}
          </div>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          {business.description && (
            <p className="text-muted">{business.description}</p>
          )}
          <p className="text-sm text-muted">
            {[business.address, business.city, business.phone]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <Link
            href={`/book/${business.id}`}
            className="hidden min-h-11 items-center rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark md:inline-flex"
          >
            رزرو نوبت
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">خدمات</h2>
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">
                  {CATEGORY_FA[s.category as ServiceCategory] ?? s.category} ·{" "}
                  {formatDuration(s.durationMin)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="font-bold text-brand">
                  {formatToman(s.priceIrr)}
                </p>
                <Link
                  href={`/book/${business.id}?serviceId=${s.id}`}
                  className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 py-1.5 text-sm text-white hover:bg-brand-dark"
                >
                  انتخاب
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {hours.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">ساعات کاری</h2>
          <ul className="space-y-2 rounded-3xl border border-border bg-card p-4 text-sm">
            {WEEKDAY_ORDER_IR.map((weekday) => {
              const h = hours.find((x) => x.weekday === weekday);
              const closed = !h;
              return (
                <li
                  key={weekday}
                  className={`flex justify-between ${closed ? "text-muted" : ""}`}
                >
                  <span>{WEEKDAY_FA[weekday]}</span>
                  <span dir="ltr">
                    {h
                      ? `${minutesToHm(h.startMin)} – ${minutesToHm(h.endMin)}`
                      : "تعطیل"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="text-sm">
            {minPrice != null ? (
              <>
                <span className="text-muted">از </span>
                <span className="font-bold text-brand">
                  {formatToman(minPrice)}
                </span>
              </>
            ) : (
              <span className="text-muted">رزرو آنلاین</span>
            )}
          </div>
          <Link
            href={`/book/${business.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-6 py-2.5 font-medium text-white"
          >
            رزرو نوبت
          </Link>
        </div>
      </div>
    </div>
  );
}
