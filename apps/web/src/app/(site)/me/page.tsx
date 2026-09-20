"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";
import { notifyAuthChange } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<Me>("/me")
      .then((u) => {
        setMe(u);
        setName(u.name ?? "");
      })
      .catch(() => router.push("/login?next=/me"));
  }, [router]);

  async function save(e: FormEvent) {
    e.preventDefault();
    const u = await api<Me>("/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    setMe(u);
    setMsg("ذخیره شد");
    notifyAuthChange();
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    notifyAuthChange();
    router.push("/");
    router.refresh();
  }

  if (!me) {
    return <Skeleton className="mx-auto h-48 max-w-md" />;
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">پروفایل</h1>
      <Card>
        <form onSubmit={save} className="space-y-4">
          <p className="text-sm text-muted" dir="ltr">
            {me.phone}
          </p>
          <label className="block text-sm">
            نام
            <input
              className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {msg && <p className="text-sm text-brand">{msg}</p>}
          <Button type="submit" className="w-full">
            ذخیره
          </Button>
        </form>
      </Card>
      <Link href="/me/bookings" className="block text-brand">
        نوبت‌های من
      </Link>
      {me.role === "PROFESSIONAL" && (
        <Link href="/pro/business" className="block text-brand">
          ورود به پنل کسب‌وکار
        </Link>
      )}
      <Button variant="danger" onClick={logout} className="px-0">
        خروج
      </Button>
    </div>
  );
}
