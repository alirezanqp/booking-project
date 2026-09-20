"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, type Business, type Me } from "@/lib/api";

export default function ProBusinessPage() {
  return <BusinessForm />;
}

function BusinessForm() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      const me = await api<Me>("/me");
      const b = await api<Business>(
        `/businesses/${me.professional!.businessId}`,
      );
      setBusiness(b);
      setForm({
        name: b.name,
        description: b.description ?? "",
        address: b.address ?? "",
        city: b.city ?? "",
        phone: b.phone ?? "",
      });
    })();
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!business) return;
    const updated = await api<Business>(`/businesses/${business.id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setBusiness(updated);
    setMsg("ذخیره شد");
  }

  if (!business) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card className="mx-auto max-w-lg">
      <form onSubmit={save} className="space-y-4">
        <h1 className="text-xl font-bold">اطلاعات کسب‌وکار</h1>
        {(
          [
            ["name", "نام"],
            ["description", "توضیحات"],
            ["address", "آدرس"],
            ["city", "شهر"],
            ["phone", "تلفن"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            {label}
            <input
              className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        {msg && <p className="text-sm text-brand">{msg}</p>}
        <Button type="submit" className="w-full">
          ذخیره
        </Button>
      </form>
    </Card>
  );
}
