"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";

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
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!me) return <p className="text-muted">در حال بارگذاری...</p>;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">پروفایل</h1>
      <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-5">
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
        <button className="w-full rounded-full bg-brand py-3 text-white">
          ذخیره
        </button>
      </form>
      <Link href="/me/bookings" className="block text-brand">
        نوبت‌های من
      </Link>
      {me.role === "PROFESSIONAL" && (
        <Link href="/pro/business" className="block text-brand">
          پنل حرفه‌ای
        </Link>
      )}
      <button onClick={logout} className="text-sm text-danger">
        خروج
      </button>
    </div>
  );
}
