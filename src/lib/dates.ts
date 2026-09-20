import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const DAY_KEY = "yyyy-MM-dd";

export function dayKey(date: Date | string = new Date()) {
  return format(typeof date === "string" ? new Date(date) : date, DAY_KEY);
}

export function weekKey(date: Date = new Date()) {
  return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
}

export function monthKey(date: Date = new Date()) {
  return format(date, "yyyy-MM");
}

export function yearKey(date: Date = new Date()) {
  return format(date, "yyyy");
}

export function weekRange(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function monthRange(date: Date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function weekDays(date: Date = new Date()) {
  const { start } = weekRange(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function lastNDays(n: number, date: Date = new Date()) {
  return Array.from({ length: n }, (_, i) => addDays(date, -(n - 1 - i)));
}
