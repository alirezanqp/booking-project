"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";

const LINKS = [
  { href: "/pro/business", label: "کسب‌وکار" },
  { href: "/pro/services", label: "خدمات" },
  { href: "/pro/hours", label: "ساعات کاری" },
];

export function ProShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<Me>("/me")
      .then((me) => {
        if (me.role !== "PROFESSIONAL" || !me.professional) {
          router.replace("/login?role=PROFESSIONAL&next=/pro/business");
          return;
        }
        setReady(true);
      })
      .catch(() =>
        router.replace("/login?role=PROFESSIONAL&next=/pro/business"),
      );
  }, [router]);

  if (!ready) return <p className="text-muted">در حال بارگذاری...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-2 text-sm ${
              pathname === l.href
                ? "bg-brand text-white"
                : "border border-border bg-card"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
