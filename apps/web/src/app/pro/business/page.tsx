"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProShell } from "@/components/ProShell";
import { api, type Business, type Me } from "@/lib/api";

export default function ProBusinessPage() {
  return (
    <ProShell>
      <BusinessForm />
    </ProShell>
  );
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
      const b = await api<Business>(`/businesses/${me.professional!.businessId}`);
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

  if (!business) return <p className="text-muted">...</p>;

  return (
    <form
      onSubmit={save}
      className="mx-auto max-w-lg space-y-4 rounded-3xl border border-border bg-card p-5"
    >
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
      <button className="w-full rounded-full bg-brand py-3 text-white">
        ذخیره
      </button>
    </form>
  );
}
