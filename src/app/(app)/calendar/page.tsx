"use client";

import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import { weekRange } from "@/lib/dates";
import type { CalendarEvent } from "@/lib/types";
import { Button, Field, Input, Modal, Panel, Select, Textarea, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";

const categories = ["focus", "meeting", "personal", "health", "admin"] as const;
const categoryColor: Record<string, string> = {
  focus: "#c8a35a",
  meeting: "#7aa2f7",
  personal: "#bb9af7",
  health: "#4ec9a5",
  admin: "#8b9198",
};

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", start: "09:00", end: "10:00", category: "focus", notes: "" });
  const events = useResource<CalendarEvent[]>("/api/events");

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: weekRange(startOfMonth(month)).start,
        end: weekRange(endOfMonth(month)).end,
      }),
    [month],
  );

  const dayEvents = (day: Date) =>
    (events.data ?? []).filter((event) => isSameDay(new Date(event.start), day));

  async function createEvent() {
    if (!form.title.trim()) return;
    const start = new Date(selected);
    const [sh, sm] = form.start.split(":").map(Number);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(selected);
    const [eh, em] = form.end.split(":").map(Number);
    end.setHours(eh, em, 0, 0);
    await api("/api/events", {
      method: "POST",
      body: {
        title: form.title,
        notes: form.notes || null,
        start,
        end,
        category: form.category,
        color: categoryColor[form.category],
      },
    });
    setForm({ title: "", start: "09:00", end: "10:00", category: "focus", notes: "" });
    setOpen(false);
    await events.reload();
  }

  async function remove(id: string) {
    await api(`/api/events/${id}`, { method: "DELETE" });
    await events.reload();
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="eyebrow">Time</p>
          <h1 className="display mt-3 text-4xl">{format(month, "MMMM yyyy")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setMonth(addMonths(month, -1))}>
            <Icon name="chevronLeft" size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMonth(addMonths(month, 1))}>
            <Icon name="chevronRight" size={16} />
          </Button>
          <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
            <Icon name="plus" size={14} /> Event
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Panel className="p-4">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-[var(--line)]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
              <div key={label} className="bg-[#0a0b0d] py-2 text-center text-[10px] uppercase tracking-[0.18em] text-faint">
                {label}
              </div>
            ))}
            {days.map((day) => {
              const items = dayEvents(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={cx(
                    "min-h-[96px] bg-[#0a0b0d] p-2 text-left transition-colors hover:bg-white/4",
                    day.getMonth() !== month.getMonth() && "opacity-35",
                    isSameDay(day, selected) && "ring-1 ring-inset ring-[rgba(200,163,90,0.5)]",
                  )}
                >
                  <div className={cx("font-mono text-xs", isSameDay(day, new Date()) && "text-[var(--accent)]")}>
                    {format(day, "d")}
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded px-1.5 py-0.5 text-[10px]"
                        style={{
                          background: `${categoryColor[event.category]}1f`,
                          color: categoryColor[event.category],
                        }}
                      >
                        {format(new Date(event.start), "HH:mm")} {event.title}
                      </div>
                    ))}
                    {items.length > 3 ? <div className="text-[10px] text-faint">+{items.length - 3}</div> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel className="h-fit p-5">
          <div className="eyebrow">{format(selected, "EEEE d MMMM")}</div>
          <div className="mt-4 space-y-2">
            {dayEvents(selected).length === 0 ? (
              <EmptyState title="No events" hint="Click + Event to plan this day." />
            ) : (
              dayEvents(selected).map((event) => (
                <div key={event.id} className="group rounded-xl border border-[var(--line)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm">{event.title}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-faint">
                        {format(new Date(event.start), "HH:mm")}–{format(new Date(event.end), "HH:mm")} · {event.category}
                      </div>
                      {event.notes ? <p className="mt-2 text-xs text-muted">{event.notes}</p> : null}
                    </div>
                    <button onClick={() => remove(event.id)} className="text-faint opacity-0 transition hover:text-[var(--danger)] group-hover:opacity-100">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Button size="sm" onClick={() => setOpen(true)} className="w-full">
              <Icon name="plus" size={14} /> Add to this day
            </Button>
          </div>
        </Panel>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`New event · ${format(selected, "d MMM")}`}>
        <Field label="Title">
          <Input value={form.title} onChange={(value) => setForm({ ...form, title: value })} autoFocus />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Start">
            <Input type="time" value={form.start} onChange={(value) => setForm({ ...form, start: value })} />
          </Field>
          <Field label="End">
            <Input type="time" value={form.end} onChange={(value) => setForm({ ...form, end: value })} />
          </Field>
          <Field label="Category">
            <Select
              className="w-full"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={categories.map((value) => ({ value, label: value }))}
            />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} rows={3} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={createEvent}>Save event</Button>
        </div>
      </Modal>
    </div>
  );
}
