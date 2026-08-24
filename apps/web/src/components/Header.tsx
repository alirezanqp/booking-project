"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";

export function Header() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api<Me>("/me")
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand">
          نوبت‌زیبا
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted">
          <Link href="/search" className="hover:text-fg">
            جستجو
          </Link>
          {me === undefined ? null : me ? (
            <>
              <Link href="/me/bookings" className="hover:text-fg">
                نوبت‌ها
              </Link>
              <Link href="/me" className="hover:text-fg">
                {me.name || "پروفایل"}
              </Link>
              {me.role === "PROFESSIONAL" && (
                <Link href="/pro/business" className="hover:text-fg">
                  پنل حرفه‌ای
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-fg">
                ورود
              </Link>
              <Link
                href="/login?role=PROFESSIONAL"
                className="rounded-full bg-brand px-3 py-1.5 text-white hover:bg-brand-dark"
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
