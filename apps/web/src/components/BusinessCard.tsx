import Link from "next/link";
import type { Business } from "@/lib/api";
import { formatToman } from "@/lib/dates";

export function BusinessCard({ business }: { business: Business }) {
  const minPrice = business.services?.length
    ? Math.min(...business.services.map((s) => s.priceIrr))
    : null;
  return (
    <Link
      href={`/b/${business.id}`}
      className="block overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-36 items-end bg-gradient-to-l from-teal-100 to-amber-50 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-brand shadow">
          {business.name.slice(0, 1)}
        </div>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-bold">{business.name}</h3>
        <p className="line-clamp-2 text-sm text-muted">
          {business.description || business.address || business.city}
        </p>
        {minPrice != null && (
          <p className="pt-1 text-sm font-medium text-brand">
            از {formatToman(minPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
