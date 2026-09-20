"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";
import { notifyAuthChange } from "@/lib/auth";
import { Skeleton } from "@/components/ui/Skeleton";

const LINKS = [
  { href: "/pro/business", label: "کسب‌وکار" },
  { href: "/pro/services", label: "خدمات" },
  { href: "/pro/hours", label: "ساعات کاری" },
];

export function ProShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api<Me>("/me")
      .then((user) => {
        if (user.role !== "PROFESSIONAL" || !user.professional) {
          router.replace("/login?role=PROFESSIONAL&next=/pro/business");
          return;
        }
        setMe(user);
      })
      .catch(() =>
        router.replace("/login?role=PROFESSIONAL&next=/pro/business"),
      );
  }, [router]);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    notifyAuthChange();
    router.push("/");
    router.refresh();
  }

  if (!me) {
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
        <div className="border-b border-border bg-card px-4 py-4">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-3 px-4 py-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/pro/business" className="flex shrink-0 items-center gap-2.5">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-sm font-bold text-white"
              >
                ن
              </span>
              <span className="hidden font-bold sm:inline">نوبتی</span>
            </Link>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-muted">داشبورد کسب‌وکار</p>
              <p className="truncate text-sm font-medium">
                {me.name || me.phone}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-black/[0.03] hover:text-fg"
            >
              سایت
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-black/[0.03] hover:text-danger"
            >
              خروج
            </button>
          </div>
        </div>

        <nav className="border-t border-border/70">
          <div className="chip-scroll mx-auto max-w-5xl px-4 py-2">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-xl px-4 py-2 text-sm whitespace-nowrap transition ${
                    active
                      ? "bg-brand font-medium text-white"
                      : "text-muted hover:bg-black/[0.03] hover:text-fg"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
