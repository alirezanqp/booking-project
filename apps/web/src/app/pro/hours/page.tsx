"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, type Me, type WorkingHour } from "@/lib/api";
import {
  WEEKDAY_FA,
  WEEKDAY_ORDER_IR,
  minutesToHm,
} from "@/lib/dates";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

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
  return <HoursEditor />;
}

function HoursEditor() {
  const [professionalId, setProfessionalId] = useState("");
  const [days, setDays] = useState<Draft[] | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<Me>("/me").then(async (me) => {
      const pid = me.professional!.id;
      setProfessionalId(pid);
      const hours = await api<WorkingHour[]>(
        `/professionals/${pid}/working-hours`,
      );
      setDays(
        WEEKDAY_ORDER_IR.map((weekday) => {
          const h = hours.find((x) => x.weekday === weekday);
          if (!h) {
            return {
              weekday,
              start: "09:00",
              end: weekday === 4 ? "14:00" : "18:00",
              open: false,
            };
          }
          return {
            weekday,
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
    if (!days) return;
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

  if (!days) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <h1 className="text-xl font-bold">ساعات کاری</h1>
      {days.map((d, i) => (
        <Card key={d.weekday} className="!p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-11 items-center gap-2 font-medium">
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
            {d.open ? (
              <div className="flex items-center gap-2" dir="ltr">
                <input
                  type="time"
                  value={d.start}
                  onChange={(e) => {
                    const next = [...days];
                    next[i] = { ...d, start: e.target.value };
                    setDays(next);
                  }}
                  className="min-h-11 rounded-xl border border-border px-2 py-1"
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
                  className="min-h-11 rounded-xl border border-border px-2 py-1"
                />
                <span className="text-xs text-muted">
                  {minutesToHm(timeToMin(d.start))}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted">تعطیل</span>
            )}
          </div>
        </Card>
      ))}
      {msg && <p className="text-sm text-brand">{msg}</p>}
      <Button type="submit">ذخیره ساعات</Button>
    </form>
  );
}
