"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import { dayKey, lastNDays } from "@/lib/dates";
import type { CurrentUser, DashboardData } from "@/lib/types";
import { Badge, Button, Checkbox, EmptyState, Field, Input, Modal, Panel, Progress, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

const prompts = [
  "What needs to happen today for today to count?",
  "What would make today a win, even if nothing else happens?",
  "What are you avoiding — and what is it costing you?",
  "Who do you want to be by tonight?",
  "What is the one thing that makes everything else easier?",
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function CommandCenter() {
  const { data, loading, reload } = useResource<DashboardData>("/api/dashboard");
  const me = useResource<{ user: CurrentUser | null }>("/api/me");
  const firstName = me.data?.user?.name?.split(" ")[0] ?? null;
  const [capture, setCapture] = useState<null | "task" | "note" | "journal" | "event">(null);
  const [draft, setDraft] = useState("");
  const [draftExtra, setDraftExtra] = useState("");
  const today = dayKey();

  const slots = useMemo(() => {
    const byslot = new Map((data?.priorities ?? []).map((p) => [p.slot, p]));
    return [1, 2, 3, 4, 5].map((slot) => ({
      slot,
      text: byslot.get(slot)?.text ?? "",
      done: byslot.get(slot)?.done ?? false,
    }));
  }, [data]);

  const [editing, setEditing] = useState<Record<number, string>>({});

  async function savePriorities(next: Array<{ slot: number; text: string; done: boolean }>) {
    await api("/api/priorities", { method: "PUT", body: { date: today, items: next } });
    await reload();
  }

  async function toggleHabit(habitId: string, done: boolean) {
    await api("/api/habits/log", { method: "POST", body: { habitId, date: today, done } });
    await reload();
  }

  async function toggleTask(id: string, done: boolean) {
    await api(`/api/tasks/${id}`, {
      method: "PATCH",
      body: { status: done ? "done" : "todo", completedAt: done ? new Date().toISOString() : null },
    });
    await reload();
  }

  async function submitCapture() {
    if (!draft.trim()) return setCapture(null);
    if (capture === "task") {
      await api("/api/tasks", { method: "POST", body: { title: draft, dueDate: new Date().toISOString() } });
    } else if (capture === "note") {
      await api("/api/notes", { method: "POST", body: { title: draft, body: draftExtra } });
    } else if (capture === "journal") {
      await api("/api/journal", { method: "POST", body: { type: "free", date: today, title: draft, body: draftExtra } });
    } else if (capture === "event") {
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await api("/api/events", { method: "POST", body: { title: draft, start, end } });
    }
    setDraft("");
    setDraftExtra("");
    setCapture(null);
    await reload();
  }

  const doneToday = data?.habits.filter((habit) =>
    data.habitLogs.some((log) => log.habitId === habit.id && log.date === today && log.done),
  ).length ?? 0;

  const prioritiesDone = slots.filter((slot) => slot.done && slot.text).length;
  const prioritiesSet = slots.filter((slot) => slot.text).length;
  const weeklyObjective = (() => {
    if (!data?.weeklyReview) return null;
    try {
      const parsed = JSON.parse(data.weeklyReview.answers) as Record<string, string>;
      return parsed.objective ?? parsed.priorities ?? null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-8">
      <header className="rise">
        <p className="eyebrow">{format(new Date(), "EEEE · d MMMM yyyy")}</p>
        <h1 className="display mt-3 text-4xl uppercase tracking-tight sm:text-5xl">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
          {data ? <span className="text-[var(--accent)]">.</span> : null}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {prompts[new Date().getDate() % prompts.length]}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={() => setCapture("task")}>
            <Icon name="plus" size={14} /> Task
          </Button>
          <Button size="sm" onClick={() => setCapture("event")}>
            <Icon name="calendar" size={14} /> Time block
          </Button>
          <Button size="sm" onClick={() => setCapture("journal")}>
            <Icon name="journal" size={14} /> Journal
          </Button>
          <Button size="sm" onClick={() => setCapture("note")}>
            <Icon name="notes" size={14} /> Note
          </Button>
        </div>
      </header>

      {loading ? <div className="text-sm text-faint">Preparing your day…</div> : null}

      {data ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Today&apos;s 5</div>
                <h2 className="display mt-1 text-2xl">The five that decide today</h2>
              </div>
              <Badge tone={prioritiesDone === prioritiesSet && prioritiesSet > 0 ? "ok" : "accent"}>
                {prioritiesDone}/{Math.max(prioritiesSet, 5)}
              </Badge>
            </div>

            <ol className="mt-5 space-y-1.5">
              {slots.map((slot) => {
                const value = editing[slot.slot] ?? slot.text;
                return (
                  <li
                    key={slot.slot}
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-[var(--line)] hover:bg-white/3"
                  >
                    <span className="font-mono text-xs text-faint">0{slot.slot}</span>
                    <Checkbox
                      checked={slot.done}
                      onChange={(checked) =>
                        savePriorities(
                          slots.map((s) => (s.slot === slot.slot ? { ...s, text: value, done: checked } : s)),
                        )
                      }
                    />
                    <input
                      value={value}
                      placeholder="Name it plainly…"
                      onChange={(event) =>
                        setEditing((prev) => ({ ...prev, [slot.slot]: event.target.value }))
                      }
                      onBlur={() =>
                        value !== slot.text &&
                        savePriorities(slots.map((s) => (s.slot === slot.slot ? { ...s, text: value } : s)))
                      }
                      className={cx(
                        "w-full bg-transparent text-[15px] outline-none placeholder:text-faint",
                        slot.done && "text-faint line-through",
                      )}
                    />
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel className="p-6">
            <div className="eyebrow">Progress</div>
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">Today&apos;s 5</span>
                  <span className="font-mono text-sm">{prioritiesDone}/5</span>
                </div>
                <div className="mt-2">
                  <Progress value={(prioritiesDone / 5) * 100} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">Habits today</span>
                  <span className="font-mono text-sm">
                    {doneToday}/{data.habits.length || 0}
                  </span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={data.habits.length ? (doneToday / data.habits.length) * 100 : 0}
                    tone="ok"
                  />
                </div>
              </div>
              <div className="flex gap-6 border-t border-[var(--line)] pt-4">
                <div>
                  <div className="display text-3xl">{data.stats.doneThisWeek}</div>
                  <div className="eyebrow mt-1">Done this week</div>
                </div>
                <div>
                  <div className="display text-3xl">{data.stats.createdThisWeek}</div>
                  <div className="eyebrow mt-1">Captured</div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Schedule</div>
              <Link href="/calendar" className="text-xs text-muted hover:text-fg">
                Calendar →
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {data.events.length === 0 ? (
                <EmptyState title="No blocks today" hint="Protect your deep work." />
              ) : (
                data.events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 rounded-xl bg-white/3 px-3 py-2.5">
                    <span className="mt-0.5 font-mono text-xs text-[var(--accent)]">
                      {format(new Date(event.start), "HH:mm")}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm">{event.title}</div>
                      <div className="text-xs text-faint">
                        {format(new Date(event.start), "HH:mm")}–{format(new Date(event.end), "HH:mm")} · {event.category}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Due today</div>
              <Link href="/tasks" className="text-xs text-muted hover:text-fg">
                Tasks →
              </Link>
            </div>
            <div className="mt-4 space-y-1">
              {data.tasks.length === 0 ? (
                <EmptyState title="Nothing due" hint="Pull something forward." />
              ) : (
                data.tasks.slice(0, 7).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/3">
                    <Checkbox checked={task.status === "done"} onChange={(c) => toggleTask(task.id, c)} size={16} />
                    <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
                    {task.project ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-faint">
                        {task.project.name}
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Habits</div>
              <Link href="/habits" className="text-xs text-muted hover:text-fg">
                All habits →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.habits.length === 0 ? (
                <EmptyState title="No habits yet" hint="Consistency over perfection." />
              ) : (
                data.habits.map((habit) => {
                  const done = data.habitLogs.some(
                    (log) => log.habitId === habit.id && log.date === today && log.done,
                  );
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id, !done)}
                      className={cx(
                        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                        done
                          ? "border-[rgba(78,201,165,0.45)] bg-[rgba(78,201,165,0.12)] text-[var(--ok)]"
                          : "border-[var(--line-strong)] text-muted hover:text-fg",
                      )}
                    >
                      <Icon name={done ? "flame" : "habits"} size={13} />
                      {habit.name}
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-5">
              <div className="eyebrow mb-2">Last 14 days</div>
              <div className="flex gap-1">
                {lastNDays(14).map((day) => {
                  const key = dayKey(day);
                  const count = data.habitLogs.filter((log) => log.date === key && log.done).length;
                  const ratio = data.habits.length ? count / data.habits.length : 0;
                  return (
                    <div
                      key={key}
                      title={`${key} · ${count} done`}
                      className="h-7 flex-1 rounded-[5px] border border-white/6"
                      style={{ background: `rgba(200,163,90,${0.08 + ratio * 0.8})` }}
                    />
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Journal prompt</div>
              <Link href="/journal" className="text-xs text-muted hover:text-fg">
                Open journal →
              </Link>
            </div>
            <p className="display mt-3 text-2xl leading-snug">
              {data.journalToday
                ? "Today is already written. Add to it?"
                : "Did I do what I said I would do?"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {data.journalToday
                ? `Last entry ${format(new Date(data.journalToday.updatedAt), "HH:mm")} · ${data.journalToday.type}`
                : "Three minutes of honesty beats an hour of planning."}
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => setCapture("journal")}>
                Write now
              </Button>
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="eyebrow">Upcoming deadlines</div>
            <div className="mt-4 space-y-2">
              {data.upcoming.length === 0 ? (
                <EmptyState title="Clear horizon" />
              ) : (
                data.upcoming.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-muted">{task.title}</span>
                    <span className="shrink-0 font-mono text-xs text-[var(--warn)]">
                      {task.dueDate ? format(new Date(task.dueDate), "d MMM") : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel className="p-6 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="eyebrow">This week&apos;s objective</div>
                <p className="display mt-2 text-2xl">
                  {weeklyObjective ?? "Set the one outcome that defines this week."}
                </p>
              </div>
              <Link href="/reviews">
                <Button size="sm">
                  {weeklyObjective ? "Open weekly review" : "Set objective"} <Icon name="arrow" size={14} />
                </Button>
              </Link>
            </div>
            {data.goals.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.goals.map((goal) => {
                  const tasks = goal.projects.flatMap((project) => project.tasks);
                  const done = tasks.filter((task) => task.status === "done").length;
                  const value = tasks.length ? (done / tasks.length) * 100 : goal.progress;
                  return (
                    <Link key={goal.id} href="/goals" className="panel panel-hover block p-4">
                      <div className="text-sm">{goal.title}</div>
                      <div className="mt-3">
                        <Progress value={value} />
                      </div>
                      <div className="mt-2 font-mono text-[11px] text-faint">
                        {Math.round(value)}% · {goal.projects.length} projects
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </Panel>
        </div>
      ) : null}

      <Modal
        open={capture !== null}
        onClose={() => setCapture(null)}
        title={
          capture === "task"
            ? "Quick task"
            : capture === "event"
              ? "Time block"
              : capture === "journal"
                ? "Journal entry"
                : "Note"
        }
      >
        <Field label={capture === "note" || capture === "journal" ? "Title" : "What"}>
          <Input value={draft} onChange={setDraft} autoFocus placeholder="Say it in one line" onEnter={submitCapture} />
        </Field>
        {capture === "note" || capture === "journal" ? (
          <Field label="Body">
            <Textarea value={draftExtra} onChange={setDraftExtra} rows={6} placeholder="Just write." />
          </Field>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setCapture(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitCapture}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}
