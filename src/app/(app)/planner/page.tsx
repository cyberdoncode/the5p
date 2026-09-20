"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import { weekDays, weekRange } from "@/lib/dates";
import type { CalendarEvent, Goal, Task } from "@/lib/types";
import { Badge, Button, Checkbox, EmptyState, Panel, Progress } from "@/components/ui";
import { Icon } from "@/components/icons";

type Scope = "daily" | "weekly" | "monthly" | "yearly";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

export default function PlannerPage() {
  const [scope, setScope] = useState<Scope>("daily");
  const [anchor, setAnchor] = useState(new Date());
  const tasks = useResource<Task[]>("/api/tasks");
  const events = useResource<CalendarEvent[]>("/api/events");
  const goals = useResource<Goal[]>("/api/goals");

  const dayTasks = useMemo(
    () =>
      (tasks.data ?? []).filter(
        (task) => task.dueDate && isSameDay(new Date(task.dueDate), anchor) && task.status !== "done",
      ),
    [tasks.data, anchor],
  );

  const dayEvents = useMemo(
    () => (events.data ?? []).filter((event) => isSameDay(new Date(event.start), anchor)),
    [events.data, anchor],
  );

  async function addBlock(hour: number) {
    const start = new Date(anchor);
    start.setHours(hour, 0, 0, 0);
    const title = window.prompt(`Block ${format(start, "HH:mm")} — what are you doing?`);
    if (!title) return;
    await api("/api/events", {
      method: "POST",
      body: { title, start, end: new Date(start.getTime() + 60 * 60 * 1000) },
    });
    await events.reload();
  }

  async function toggleTask(task: Task) {
    const done = task.status !== "done";
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: { status: done ? "done" : "todo", completedAt: done ? new Date().toISOString() : null },
    });
    await tasks.reload();
  }

  async function addTaskOn(date: Date) {
    const title = window.prompt(`Task for ${format(date, "EEE d MMM")}`);
    if (!title) return;
    await api("/api/tasks", { method: "POST", body: { title, dueDate: date.toISOString() } });
    await tasks.reload();
  }

  const step = scope === "monthly" || scope === "yearly" ? "month" : scope === "weekly" ? "week" : "day";

  function shift(direction: 1 | -1) {
    if (step === "month") setAnchor(addMonths(anchor, direction * (scope === "yearly" ? 12 : 1)));
    else setAnchor(addDays(anchor, direction * (step === "week" ? 7 : 1)));
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="eyebrow">Preparation</p>
          <h1 className="display mt-3 text-4xl">Planner</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => shift(-1)}>
            <Icon name="chevronLeft" size={16} />
          </Button>
          <div className="min-w-[180px] text-center font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {scope === "daily" && format(anchor, "EEE d MMM yyyy")}
            {scope === "weekly" && `${format(weekRange(anchor).start, "d MMM")} – ${format(weekRange(anchor).end, "d MMM")}`}
            {scope === "monthly" && format(anchor, "MMMM yyyy")}
            {scope === "yearly" && format(anchor, "yyyy")}
          </div>
          <Button size="sm" variant="ghost" onClick={() => shift(1)}>
            <Icon name="chevronRight" size={16} />
          </Button>
          <Button size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["daily", "weekly", "monthly", "yearly"] as Scope[]).map((value) => (
          <button
            key={value}
            onClick={() => setScope(value)}
            className={cx(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              scope === value
                ? "border-[rgba(200,163,90,0.5)] bg-[rgba(200,163,90,0.12)] text-[var(--accent)]"
                : "border-[var(--line)] text-muted hover:text-fg",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {scope === "daily" ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="p-5">
            <div className="eyebrow mb-4">Time blocking</div>
            <div className="space-y-1">
              {HOURS.map((hour) => {
                const blocks = dayEvents.filter((event) => new Date(event.start).getHours() === hour);
                return (
                  <div key={hour} className="group flex gap-3">
                    <span className="w-12 shrink-0 pt-2 font-mono text-[11px] text-faint">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                    <button
                      onClick={() => addBlock(hour)}
                      className="min-h-[38px] flex-1 rounded-xl border border-dashed border-transparent px-3 py-2 text-left transition-colors hover:border-[var(--line)] hover:bg-white/3"
                    >
                      {blocks.length === 0 ? (
                        <span className="text-xs text-transparent transition-colors group-hover:text-faint">
                          + block this hour
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {blocks.map((block) => (
                            <div
                              key={block.id}
                              className="rounded-lg border-l-2 border-[var(--accent)] bg-[rgba(200,163,90,0.09)] px-3 py-1.5 text-sm"
                            >
                              {block.title}
                              <span className="ml-2 font-mono text-[10px] text-faint">
                                {format(new Date(block.start), "HH:mm")}–{format(new Date(block.end), "HH:mm")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="h-fit p-5">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Due {format(anchor, "d MMM")}</div>
              <Button size="sm" variant="ghost" onClick={() => addTaskOn(anchor)}>
                <Icon name="plus" size={14} />
              </Button>
            </div>
            <div className="mt-4 space-y-1">
              {dayTasks.length === 0 ? (
                <EmptyState title="No tasks scheduled" />
              ) : (
                dayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/3">
                    <Checkbox checked={false} onChange={() => toggleTask(task)} size={16} />
                    <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
                    <Badge>{task.priority}</Badge>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      ) : null}

      {scope === "weekly" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {weekDays(anchor).map((day) => {
            const items = (tasks.data ?? []).filter(
              (task) => task.dueDate && isSameDay(new Date(task.dueDate), day),
            );
            const blocks = (events.data ?? []).filter((event) => isSameDay(new Date(event.start), day));
            return (
              <Panel key={day.toISOString()} className="p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="eyebrow">{format(day, "EEE")}</div>
                    <div className="display text-2xl">{format(day, "d")}</div>
                  </div>
                  <button onClick={() => addTaskOn(day)} className="text-faint hover:text-fg">
                    <Icon name="plus" size={14} />
                  </button>
                </div>
                <div className="mt-3 space-y-1.5">
                  {items.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs">
                      <Checkbox checked={task.status === "done"} onChange={() => toggleTask(task)} size={14} />
                      <span className={cx("truncate", task.status === "done" && "text-faint line-through")}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {blocks.map((block) => (
                    <div key={block.id} className="truncate rounded-md bg-[rgba(200,163,90,0.1)] px-2 py-1 text-[11px] text-[var(--accent)]">
                      {format(new Date(block.start), "HH:mm")} {block.title}
                    </div>
                  ))}
                  {items.length === 0 && blocks.length === 0 ? (
                    <p className="text-xs text-faint">Open day.</p>
                  ) : null}
                </div>
              </Panel>
            );
          })}
        </div>
      ) : null}

      {scope === "monthly" ? (
        <Panel className="p-5">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-[var(--line)]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
              <div key={label} className="bg-[#0a0b0d] py-2 text-center text-[10px] uppercase tracking-[0.18em] text-faint">
                {label}
              </div>
            ))}
            {eachDayOfInterval({
              start: weekRange(startOfMonth(anchor)).start,
              end: weekRange(endOfMonth(anchor)).end,
            }).map((day) => {
              const items = (tasks.data ?? []).filter(
                (task) => task.dueDate && isSameDay(new Date(task.dueDate), day),
              );
              const outside = day.getMonth() !== anchor.getMonth();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setAnchor(day);
                    setScope("daily");
                  }}
                  className={cx(
                    "min-h-[92px] bg-[#0a0b0d] p-2 text-left transition-colors hover:bg-white/4",
                    outside && "opacity-35",
                  )}
                >
                  <div className={cx("font-mono text-xs", isSameDay(day, new Date()) && "text-[var(--accent)]")}>
                    {format(day, "d")}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {items.slice(0, 3).map((task) => (
                      <div key={task.id} className="truncate text-[10px] text-muted">
                        · {task.title}
                      </div>
                    ))}
                    {items.length > 3 ? (
                      <div className="text-[10px] text-faint">+{items.length - 3} more</div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      ) : null}

      {scope === "yearly" ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }, (_, month) => {
              const date = new Date(anchor.getFullYear(), month, 1);
              const count = (tasks.data ?? []).filter(
                (task) =>
                  task.dueDate &&
                  new Date(task.dueDate).getMonth() === month &&
                  new Date(task.dueDate).getFullYear() === date.getFullYear(),
              ).length;
              return (
                <Panel
                  key={month}
                  className="cursor-pointer p-4 panel-hover"
                  onClick={() => {
                    setAnchor(date);
                    setScope("monthly");
                  }}
                >
                  <div className="display text-xl">{format(date, "MMMM")}</div>
                  <div className="mt-2 font-mono text-[11px] text-faint">{count} scheduled</div>
                </Panel>
              );
            })}
          </div>
          <Panel className="p-6">
            <div className="eyebrow">Goals this year</div>
            <div className="mt-4 space-y-4">
              {(goals.data ?? []).length === 0 ? (
                <EmptyState title="No goals yet" hint="Goals give the calendar meaning." />
              ) : (
                (goals.data ?? []).map((goal) => {
                  const all = goal.projects.flatMap((project) => project.tasks);
                  const done = all.filter((task) => task.status === "done").length;
                  const value = all.length ? (done / all.length) * 100 : goal.progress;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm">
                        <span>{goal.title}</span>
                        <span className="font-mono text-xs text-faint">{Math.round(value)}%</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={value} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
