const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000;

export function parseCivilDate(isoDate: string): { y: number; m: number; d: number; weekday: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) throw new Error("bad-date");
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  return { y, m: mo - 1, d, weekday };
}

/** Minutes from Tehran midnight → UTC Date */
export function tehranInstant(y: number, monthIndex: number, d: number, minutes: number): Date {
  return new Date(Date.UTC(y, monthIndex, d, 0, minutes) - TEHRAN_OFFSET_MS);
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}
