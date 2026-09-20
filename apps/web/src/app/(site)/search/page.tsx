import Link from "next/link";
import { CATEGORY_FA, type ServiceCategory } from "@booking/shared";
import { BusinessCard } from "@/components/BusinessCard";
import { CategoryChips } from "@/components/CategoryChips";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, type Business } from "@/lib/api";
import { toFaDigits } from "@/lib/dates";

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
    ? (CATEGORY_FA[sp.category as ServiceCategory] ?? "جستجو")
    : sp.q
      ? `نتایج «${sp.q}»`
      : "جستجو";

  const hasFilter = Boolean(sp.q || sp.category || sp.city);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <CategoryChips active={sp.category} />
      <form className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="نام سالن یا خدمت"
          className="min-h-11 min-w-[12rem] flex-1 rounded-full border border-border bg-card px-4 py-2"
        />
        <input
          name="city"
          defaultValue={sp.city}
          placeholder="شهر"
          className="min-h-11 w-full rounded-full border border-border bg-card px-4 py-2 sm:w-36"
        />
        {sp.category && (
          <input type="hidden" name="category" value={sp.category} />
        )}
        <button className="min-h-11 rounded-full bg-brand px-5 py-2 text-white">
          اعمال
        </button>
      </form>
      <p className="text-sm text-muted">
        {toFaDigits(businesses.length)} نتیجه
      </p>
      {businesses.length === 0 ? (
        <EmptyState
          title="نتیجه‌ای پیدا نشد"
          description="عبارت دیگری را امتحان کنید یا فیلترها را پاک کنید."
          action={
            hasFilter ? (
              <Link href="/search" className="text-brand">
                پاک کردن فیلترها
              </Link>
            ) : undefined
          }
        />
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
