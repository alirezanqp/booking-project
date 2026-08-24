"use client";

import { FormEvent, useEffect, useState } from "react";
import { CATEGORY_FA, SERVICE_CATEGORIES } from "@booking/shared";
import { ProShell } from "@/components/ProShell";
import { api, type Me, type Service } from "@/lib/api";
import { formatToman } from "@/lib/dates";

export default function ProServicesPage() {
  return (
    <ProShell>
      <ServicesManager />
    </ProShell>
  );
}

function ServicesManager() {
  const [businessId, setBusinessId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "HAIRCUT",
    priceIrr: 300000,
    durationMin: 30,
  });

  async function load(bid: string) {
    const list = await api<Service[]>(`/businesses/${bid}/services?all=1`);
    setServices(list);
  }

  useEffect(() => {
    api<Me>("/me").then(async (me) => {
      const bid = me.professional!.businessId;
      setBusinessId(bid);
      await load(bid);
    });
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    await api(`/businesses/${businessId}/services`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    setForm({ ...form, name: "" });
    await load(businessId);
  }

  async function toggle(s: Service) {
    await api(`/services/${s.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !s.active }),
    });
    await load(businessId);
  }

  async function remove(id: string) {
    await api(`/services/${id}`, { method: "DELETE" });
    await load(businessId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">خدمات</h1>
      <form
        onSubmit={create}
        className="grid gap-3 rounded-3xl border border-border bg-card p-5 sm:grid-cols-2"
      >
        <label className="text-sm sm:col-span-2">
          نام خدمت
          <input
            required
            className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="text-sm">
          دسته
          <select
            className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_FA[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          قیمت (تومان/ریال)
          <input
            type="number"
            className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
            value={form.priceIrr}
            onChange={(e) =>
              setForm({ ...form, priceIrr: Number(e.target.value) })
            }
          />
        </label>
        <label className="text-sm">
          مدت (دقیقه)
          <input
            type="number"
            className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
            value={form.durationMin}
            onChange={(e) =>
              setForm({ ...form, durationMin: Number(e.target.value) })
            }
          />
        </label>
        <button className="rounded-full bg-brand py-3 text-white sm:col-span-2">
          افزودن خدمت
        </button>
      </form>

      <div className="space-y-3">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">
                {s.name}{" "}
                {!s.active && (
                  <span className="text-xs text-muted">(غیرفعال)</span>
                )}
              </p>
              <p className="text-sm text-muted">
                {s.durationMin} دقیقه · {formatToman(s.priceIrr)}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" onClick={() => toggle(s)} className="text-brand">
                {s.active ? "غیرفعال" : "فعال"}
              </button>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="text-danger"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
