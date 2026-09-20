import Link from "next/link";
import { CATEGORY_FA, SERVICE_CATEGORIES, type ServiceCategory } from "@booking/shared";

export function CategoryChips({
  active,
  basePath = "/search",
}: {
  active?: string;
  basePath?: string;
}) {
  return (
    <div className="chip-scroll">
      {SERVICE_CATEGORIES.map((c) => {
        const selected = active === c;
        const href =
          basePath === "/search"
            ? `/search?category=${c}`
            : `${basePath}?category=${c}`;
        return (
          <Link
            key={c}
            href={href}
            className={`rounded-full border px-4 py-2 text-sm whitespace-nowrap ${
              selected
                ? "border-brand bg-brand text-white"
                : "border-border bg-card hover:border-brand hover:text-brand"
            }`}
          >
            {CATEGORY_FA[c as ServiceCategory]}
          </Link>
        );
      })}
    </div>
  );
}
