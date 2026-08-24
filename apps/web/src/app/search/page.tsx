import { BusinessCard } from "@/components/BusinessCard";
import { api, type Business } from "@/lib/api";
import { CATEGORY_FA, type ServiceCategory } from "@booking/shared";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.q) qs.set("q", sp.q);
  if (sp.category) qs.set("category", sp.category);
  if (sp.city) qs.set("city", sp.city);

  let businesses: Business[] = [];
  try {
    businesses = await api<Business[]>(`/businesses?${qs.toString()}`);
  } catch {
    businesses = [];
  }

  const title = sp.category
    ? CATEGORY_FA[sp.category as ServiceCategory] ?? "جستجو"
    : sp.q
      ? `نتایج «${sp.q}»`
      : "جستجو";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="نام سالن یا خدمت"
          className="min-w-[12rem] flex-1 rounded-full border border-border bg-card px-4 py-2"
        />
        <input
          name="city"
          defaultValue={sp.city}
          placeholder="شهر"
          className="w-36 rounded-full border border-border bg-card px-4 py-2"
        />
        <button className="rounded-full bg-brand px-5 py-2 text-white">
          اعمال
        </button>
      </form>
      {businesses.length === 0 ? (
        <p className="text-muted">نتیجه‌ای پیدا نشد.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
}
