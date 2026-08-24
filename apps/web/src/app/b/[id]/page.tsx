import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_FA, type ServiceCategory } from "@booking/shared";
import { api, type Business } from "@/lib/api";
import { formatToman, WEEKDAY_FA, minutesToHm } from "@/lib/dates";

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

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card">
        <div className="h-40 bg-gradient-to-l from-teal-100 to-amber-50 md:h-52" />
        <div className="space-y-3 p-6">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-muted">{business.description}</p>
          <p className="text-sm text-muted">
            {[business.address, business.city, business.phone]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <Link
            href={`/book/${business.id}`}
            className="inline-flex rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark"
          >
            رزرو نوبت
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">خدمات</h2>
        <div className="space-y-3">
          {(business.services ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">
                  {CATEGORY_FA[s.category as ServiceCategory] ?? s.category} ·{" "}
                  {s.durationMin} دقیقه
                </p>
              </div>
              <div className="text-left">
                <p className="font-bold text-brand">{formatToman(s.priceIrr)}</p>
                <Link
                  href={`/book/${business.id}?serviceId=${s.id}`}
                  className="text-sm text-brand"
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
            {WEEKDAY_FA.map((label, weekday) => {
              const h = hours.find((x) => x.weekday === weekday);
              return (
                <li key={weekday} className="flex justify-between">
                  <span>{label}</span>
                  <span className="text-muted" dir="ltr">
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
    </div>
  );
}
