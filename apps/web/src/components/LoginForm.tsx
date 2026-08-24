"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, type Me } from "@/lib/api";

export function LoginForm({ defaultRole }: { defaultRole?: "CUSTOMER" | "PROFESSIONAL" }) {
  const router = useRouter();
  const params = useSearchParams();
  const role =
    (params.get("role") as "CUSTOMER" | "PROFESSIONAL" | null) ??
    defaultRole ??
    "CUSTOMER";
  const next = params.get("next") ?? (role === "PROFESSIONAL" ? "/pro/business" : "/");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone, role }),
      });
      setStep("code");
    } catch (err) {
      setError((err as { message: string }).message);
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api<Me>("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code, name: name || undefined, role }),
      });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError((err as { message: string }).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-bold">
        {role === "PROFESSIONAL" ? "ورود حرفه‌ای" : "ورود / ثبت‌نام"}
      </h1>
      <p className="mb-6 text-sm text-muted">
        کد تایید در کنسول سرور API چاپ می‌شود (حالت توسعه).
      </p>
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {step === "phone" ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <label className="block text-sm">
            شماره موبایل
            <input
              className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912xxxxxxx"
              dir="ltr"
              required
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-full bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            دریافت کد
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <label className="block text-sm">
            نام (اختیاری)
            <input
              className="mt-1 w-full rounded-2xl border border-border px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            کد ۶ رقمی
            <input
              className="mt-1 w-full rounded-2xl border border-border px-4 py-3 tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              dir="ltr"
              maxLength={6}
              required
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-full bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            تأیید و ورود
          </button>
          <button
            type="button"
            className="w-full text-sm text-muted"
            onClick={() => setStep("phone")}
          >
            تغییر شماره
          </button>
        </form>
      )}
    </div>
  );
}
