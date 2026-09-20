"use client";

import { useState } from "react";
import { format } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import { dayKey, lastNDays, weekDays } from "@/lib/dates";
import type { Habit } from "@/lib/types";
import { Button, EmptyState, Field, Input, Modal, Panel, Progress, Select } from "@/components/ui";
import { Icon } from "@/components/icons";

function streak(dates: Set<string>) {
  let count = 0;
  const cursor = new Date();
  for (;;) {
    const key = dayKey(cursor);
    if (dates.has(key)) count += 1;
    else if (count > 0 || key !== dayKey()) break;
    cursor.setDate(cursor.getDate() - 1);
    if (count > 730) break;
  }
  return count;
}

export default function HabitsPage() {
  const habits = useResource<Habit[]>("/api/habits");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", cue: "", cadence: "daily", targetPerWeek: "7" });

  async function create() {
    if (!form.name.trim()) return;
    await api("/api/habits", {
      method: "POST",
      body: {
        name: form.name,
        cue: form.cue || null,
        cadence: form.cadence,
        targetPerWeek: Number(form.targetPerWeek),
      },
    });
    setForm({ name: "", cue: "", cadence: "daily", targetPerWeek: "7" });
    setOpen(false);
    await habits.reload();
  }

  async function toggle(habitId: string, date: string, done: boolean) {
    await api("/api/habits/log", { method: "POST", body: { habitId, date, done } });
    await habits.reload();
  }

  async function archive(id: string) {
    await api(`/api/habits/${id}`, { method: "DELETE" });
    await habits.reload();
  }

  const week = weekDays();

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="eyebrow">Consistency over perfection</p>
          <h1 className="display mt-3 text-4xl">Habits</h1>
          <p className="mt-3 max-w-lg text-muted">
            Missing a day is data, not failure. Show up again tomorrow.
          </p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Icon name="plus" size={14} /> New habit
        </Button>
      </header>

      {(habits.data ?? []).length === 0 && !habits.loading ? (
        <EmptyState title="No habits yet" hint="Start with two. Not ten." />
      ) : null}

      <div className="space-y-4">
        {(habits.data ?? []).map((habit) => {
          const dates = new Set((habit.logs ?? []).filter((log) => log.done).map((log) => log.date));
          const weekDone = week.filter((day) => dates.has(dayKey(day))).length;
          const monthDone = lastNDays(30).filter((day) => dates.has(dayKey(day))).length;
          return (
            <Panel key={habit.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg">{habit.name}</h2>
                  {habit.cue ? <p className="mt-1 text-xs text-faint">{habit.cue}</p> : null}
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="display text-2xl text-[var(--accent)]">{streak(dates)}</div>
                    <div className="eyebrow">day streak</div>
                  </div>
                  <div className="text-right">
                    <div className="display text-2xl">{Math.round((monthDone / 30) * 100)}%</div>
                    <div className="eyebrow">30-day rate</div>
                  </div>
                  <button onClick={() => archive(habit.id)} className="text-faint hover:text-[var(--danger)]">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {week.map((day) => {
                  const key = dayKey(day);
                  const done = dates.has(key);
                  const future = day > new Date();
                  return (
                    <button
                      key={key}
                      disabled={future}
                      onClick={() => toggle(habit.id, key, !done)}
                      className={cx(
                        "flex h-14 w-14 flex-col items-center justify-center rounded-xl border text-[10px] uppercase tracking-wider transition-all",
                        done
                          ? "border-[rgba(200,163,90,0.5)] bg-[rgba(200,163,90,0.16)] text-[var(--accent)]"
                          : "border-[var(--line)] text-faint hover:border-white/25",
                        future && "opacity-30",
                      )}
                    >
                      {format(day, "EEE")}
                      <span className="mt-0.5 font-mono text-sm text-fg">{format(day, "d")}</span>
                    </button>
                  );
                })}
                <div className="ml-auto w-40">
                  <div className="flex justify-between text-[11px] text-faint">
                    <span>this week</span>
                    <span className="font-mono">
                      {weekDone}/{habit.targetPerWeek}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={(weekDone / habit.targetPerWeek) * 100} tone="ok" />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="eyebrow mb-2">Last 12 weeks</div>
                <div className="flex gap-[3px] overflow-x-auto pb-1">
                  {lastNDays(84).map((day) => {
                    const key = dayKey(day);
                    return (
                      <div
                        key={key}
                        title={key}
                        className="h-4 w-4 shrink-0 rounded-[4px] border border-white/6"
                        style={{
                          background: dates.has(key) ? "rgba(200,163,90,0.75)" : "rgba(255,255,255,0.04)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New habit">
        <Field label="Habit">
          <Input value={form.name} onChange={(value) => setForm({ ...form, name: value })} autoFocus placeholder="Read 20 pages" />
        </Field>
        <Field label="Cue (optional)">
          <Input value={form.cue} onChange={(value) => setForm({ ...form, cue: value })} placeholder="After morning coffee" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cadence">
            <Select
              className="w-full"
              value={form.cadence}
              onChange={(value) => setForm({ ...form, cadence: value })}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekdays", label: "Weekdays" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </Field>
          <Field label="Target per week">
            <Select
              className="w-full"
              value={form.targetPerWeek}
              onChange={(value) => setForm({ ...form, targetPerWeek: value })}
              options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: `${n}×` }))}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={create}>Create habit</Button>
        </div>
      </Modal>
    </div>
  );
}
