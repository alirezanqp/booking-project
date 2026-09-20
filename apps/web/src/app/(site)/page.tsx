import Link from "next/link";
import { BusinessCard } from "@/components/BusinessCard";
import { CategoryChips } from "@/components/CategoryChips";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, type Business } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let businesses: Business[] = [];
  try {
    businesses = await api<Business[]>("/businesses");
  } catch {
    businesses = [];
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-gradient-to-l from-teal-50 to-amber-50 p-6 md:p-12">
        <h1 className="mb-3 text-3xl font-bold md:text-5xl">نوبتی</h1>
        <p className="mb-2 text-lg font-medium text-fg md:text-xl">
          نوبت زیبایی، ساده و سریع
        </p>
        <p className="mb-6 max-w-xl text-muted">
          سالن و آرایشگر مورد علاقه‌تان را پیدا کنید و آنلاین وقت بگیرید.
        </p>
        <form action="/search" className="flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            name="q"
            placeholder="جستجوی سالن، خدمت یا محله..."
            className="min-h-12 flex-1 rounded-full border border-border bg-white px-5 py-3 shadow-sm"
          />
          <button className="min-h-12 rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">
            جستجو
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">دسته‌بندی‌ها</h2>
        <CategoryChips />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">سالن‌های پیشنهادی</h2>
          <Link href="/search" className="text-sm text-brand">
            همه
          </Link>
        </div>
        {businesses.length === 0 ? (
          <EmptyState
            title="هنوز کسب‌وکاری ثبت نشده"
            description="به‌زودی سالن‌های بیشتری اضافه می‌شوند."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
