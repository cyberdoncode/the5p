"use client";

import { useMemo, useState } from "react";
import { format, isBefore, isToday, startOfDay } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import type { Project, Task } from "@/lib/types";
import { Badge, Button, Checkbox, EmptyState, Field, Input, Modal, Panel, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

const priorityTone = {
  critical: "danger",
  high: "warn",
  medium: "neutral",
  low: "neutral",
} as const;

type Filter = "today" | "upcoming" | "all" | "done";

export default function TasksPage() {
  const tasks = useResource<Task[]>("/api/tasks");
  const projects = useResource<Project[]>("/api/projects");
  const [filter, setFilter] = useState<Filter>("today");
  const [quick, setQuick] = useState("");
  const [detail, setDetail] = useState<Task | null>(null);

  const list = useMemo(() => {
    const all = tasks.data ?? [];
    if (filter === "done") return all.filter((task) => task.status === "done");
    const open = all.filter((task) => task.status !== "done");
    if (filter === "all") return open;
    if (filter === "today")
      return open.filter(
        (task) =>
          task.dueDate &&
          (isToday(new Date(task.dueDate)) || isBefore(new Date(task.dueDate), startOfDay(new Date()))),
      );
    return open.filter((task) => !task.dueDate || !isBefore(new Date(task.dueDate), new Date()));
  }, [tasks.data, filter]);

  async function addQuick() {
    if (!quick.trim()) return;
    await api("/api/tasks", { method: "POST", body: { title: quick } });
    setQuick("");
    await tasks.reload();
  }

  async function toggle(task: Task) {
    const done = task.status !== "done";
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: { status: done ? "done" : "todo", completedAt: done ? new Date().toISOString() : null },
    });
    await tasks.reload();
  }

  async function update(id: string, body: Record<string, unknown>) {
    await api(`/api/tasks/${id}`, { method: "PATCH", body });
    await tasks.reload();
  }

  async function remove(id: string) {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    setDetail(null);
    await tasks.reload();
  }

  return (
    <div className="space-y-7">
      <header className="rise">
        <p className="eyebrow">Execution</p>
        <h1 className="display mt-3 text-4xl">Tasks</h1>
        <p className="mt-3 max-w-lg text-muted">Everything you owe yourself, in one honest list.</p>
      </header>

      <Panel className="flex items-center gap-3 p-3">
        <Icon name="plus" size={16} className="ml-2 text-faint" />
        <input
          value={quick}
          onChange={(event) => setQuick(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addQuick()}
          placeholder="Add a task and press Enter…"
          className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-faint"
        />
        <Button variant="primary" size="sm" onClick={addQuick}>
          Add
        </Button>
      </Panel>

      <div className="flex flex-wrap gap-2">
        {(["today", "upcoming", "all", "done"] as Filter[]).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cx(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              filter === value
                ? "border-[rgba(200,163,90,0.5)] bg-[rgba(200,163,90,0.12)] text-[var(--accent)]"
                : "border-[var(--line)] text-muted hover:text-fg",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <Panel className="divide-y divide-[var(--line)] p-2">
        {list.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nothing here" hint="A clean list is also a result." />
          </div>
        ) : (
          list.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-white/3">
              <Checkbox checked={task.status === "done"} onChange={() => toggle(task)} />
              <button onClick={() => setDetail(task)} className="min-w-0 flex-1 text-left">
                <div className={cx("truncate text-sm", task.status === "done" && "text-faint line-through")}>
                  {task.title}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-faint">
                  {task.dueDate ? <span className="font-mono">{format(new Date(task.dueDate), "d MMM")}</span> : null}
                  {task.project ? <span>{task.project.name}</span> : null}
                  {task.estimate ? <span>{task.estimate}m</span> : null}
                </div>
              </button>
              <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
            </div>
          ))
        )}
      </Panel>

      <Modal open={detail !== null} onClose={() => setDetail(null)} title="Task">
        {detail ? (
          <div className="space-y-4">
            <Field label="Title">
              <Input value={detail.title} onChange={(value) => setDetail({ ...detail, title: value })} />
            </Field>
            <Field label="Notes">
              <Textarea
                value={detail.notes ?? ""}
                onChange={(value) => setDetail({ ...detail, notes: value })}
                rows={4}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <Select
                  className="w-full"
                  value={detail.priority}
                  onChange={(value) => setDetail({ ...detail, priority: value as Task["priority"] })}
                  options={["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v }))}
                />
              </Field>
              <Field label="Due date">
                <Input
                  type="date"
                  value={detail.dueDate ? format(new Date(detail.dueDate), "yyyy-MM-dd") : ""}
                  onChange={(value) => setDetail({ ...detail, dueDate: value ? new Date(value).toISOString() : null })}
                />
              </Field>
              <Field label="Estimate (min)">
                <Input
                  type="number"
                  value={detail.estimate ? String(detail.estimate) : ""}
                  onChange={(value) => setDetail({ ...detail, estimate: value ? Number(value) : null })}
                />
              </Field>
              <Field label="Project">
                <Select
                  className="w-full"
                  value={detail.projectId ?? ""}
                  onChange={(value) => setDetail({ ...detail, projectId: value || null })}
                  options={[
                    { value: "", label: "No project" },
                    ...(projects.data ?? []).map((project) => ({ value: project.id, label: project.name })),
                  ]}
                />
              </Field>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="danger" onClick={() => remove(detail.id)}>
                <Icon name="trash" size={14} /> Delete
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  await update(detail.id, {
                    title: detail.title,
                    notes: detail.notes,
                    priority: detail.priority,
                    dueDate: detail.dueDate,
                    estimate: detail.estimate,
                    projectId: detail.projectId,
                  });
                  setDetail(null);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
