import Link from "next/link";
import type { Business } from "@/lib/api";
import { formatToman, mediaUrl } from "@/lib/dates";

export function BusinessCard({ business }: { business: Business }) {
  const minPrice = business.services?.length
    ? Math.min(...business.services.map((s) => s.priceIrr))
    : null;
  const cover = mediaUrl(business.coverUrl);
  const logo = mediaUrl(business.logoUrl);

  return (
    <Link
      href={`/b/${business.id}`}
      className="block overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-36 bg-gradient-to-l from-teal-100 to-amber-50">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-brand shadow">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : (
            business.name.slice(0, 1)
          )}
        </div>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-bold">{business.name}</h3>
        <p className="line-clamp-2 text-sm text-muted">
          {business.description || business.address || "—"}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1 text-sm">
          {business.city && (
            <span className="text-muted">{business.city}</span>
          )}
          {minPrice != null && (
            <span className="font-medium text-brand">
              از {formatToman(minPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
