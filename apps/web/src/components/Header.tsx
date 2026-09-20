"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";
import { onAuthChange } from "@/lib/auth";

export function Header() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    function load() {
      api<Me>("/me")
        .then(setMe)
        .catch(() => setMe(null));
    }
    load();
    return onAuthChange(load);
  }, []);

  function navClass(href: string) {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-xl px-3 py-2 transition-colors ${
      active
        ? "bg-teal-50 font-medium text-brand"
        : "text-muted hover:bg-black/[0.03] hover:text-fg"
    }`;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-sm font-bold text-white shadow-sm shadow-teal-900/10 transition group-hover:bg-brand-dark"
          >
            ن
          </span>
          <span className="text-lg font-bold tracking-tight text-fg">نوبتی</span>
        </Link>

        <nav className="flex min-h-11 items-center gap-0.5 text-sm sm:gap-1">
          <Link href="/search" className={`hidden sm:inline-flex ${navClass("/search")}`}>
            جستجو
          </Link>

          {me ? (
            <>
              <Link href="/me/bookings" className={navClass("/me/bookings")}>
                نوبت‌ها
              </Link>
              <Link href="/me" className={navClass("/me")}>
                <span className="max-w-[6.5rem] truncate">
                  {me.name || "پروفایل"}
                </span>
              </Link>
              {me.role === "PROFESSIONAL" && (
                <Link
                  href="/pro/business"
                  className="ms-1 inline-flex min-h-10 items-center rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium text-fg transition hover:border-brand hover:text-brand"
                >
                  پنل کسب‌وکار
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className={navClass("/login")}>
                ورود
              </Link>
              <Link
                href="/login?role=PROFESSIONAL"
                className="ms-1 inline-flex min-h-10 items-center rounded-xl bg-brand px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-dark"
              >
                ثبت کسب‌وکار
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
