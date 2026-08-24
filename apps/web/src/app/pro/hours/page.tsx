"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProShell } from "@/components/ProShell";
import { api, type Me, type WorkingHour } from "@/lib/api";
import { WEEKDAY_FA, minutesToHm } from "@/lib/dates";

type Draft = { weekday: number; start: string; end: string; open: boolean };

function minToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function ProHoursPage() {
  return (
    <ProShell>
      <HoursEditor />
    </ProShell>
  );
}

function HoursEditor() {
  const [professionalId, setProfessionalId] = useState("");
  const [days, setDays] = useState<Draft[]>(
    WEEKDAY_FA.map((_, weekday) => ({
      weekday,
      start: "09:00",
      end: weekday === 4 ? "14:00" : "18:00",
      open: weekday !== 5,
    })),
  );
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<Me>("/me").then(async (me) => {
      const pid = me.professional!.id;
      setProfessionalId(pid);
      const hours = await api<WorkingHour[]>(
        `/professionals/${pid}/working-hours`,
      );
      setDays((prev) =>
        prev.map((d) => {
          const h = hours.find((x) => x.weekday === d.weekday);
          if (!h) return { ...d, open: false };
          return {
            weekday: d.weekday,
            open: true,
            start: minToTime(h.startMin),
            end: minToTime(h.endMin),
          };
        }),
      );
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    const hours = days
      .filter((d) => d.open)
      .map((d) => ({
        weekday: d.weekday,
        startMin: timeToMin(d.start),
        endMin: timeToMin(d.end),
      }));
    await api(`/professionals/${professionalId}/working-hours`, {
      method: "PUT",
      body: JSON.stringify({ hours }),
    });
    setMsg("ساعات کاری ذخیره شد");
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <h1 className="text-xl font-bold">ساعات کاری</h1>
      {days.map((d, i) => (
        <div
          key={d.weekday}
          className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4"
        >
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={d.open}
              onChange={(e) => {
                const next = [...days];
                next[i] = { ...d, open: e.target.checked };
                setDays(next);
              }}
            />
            {WEEKDAY_FA[d.weekday]}
          </label>
          {d.open && (
            <div className="flex items-center gap-2" dir="ltr">
              <input
                type="time"
                value={d.start}
                onChange={(e) => {
                  const next = [...days];
                  next[i] = { ...d, start: e.target.value };
                  setDays(next);
                }}
                className="rounded-xl border border-border px-2 py-1"
              />
              <span>–</span>
              <input
                type="time"
                value={d.end}
                onChange={(e) => {
                  const next = [...days];
                  next[i] = { ...d, end: e.target.value };
                  setDays(next);
                }}
                className="rounded-xl border border-border px-2 py-1"
              />
              <span className="text-xs text-muted">
                {minutesToHm(timeToMin(d.start))}
              </span>
            </div>
          )}
          {!d.open && <span className="text-sm text-muted">تعطیل</span>}
        </div>
      ))}
      {msg && <p className="text-sm text-brand">{msg}</p>}
      <button className="rounded-full bg-brand px-6 py-3 text-white">
        ذخیره ساعات
      </button>
    </form>
  );
}
