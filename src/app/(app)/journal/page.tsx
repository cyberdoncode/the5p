"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import { dayKey } from "@/lib/dates";
import type { JournalEntry } from "@/lib/types";
import { Button, EmptyState, Input, Panel, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

type JournalType = "daily" | "morning" | "night" | "free";

function parseAnswers(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

const templates: Record<JournalType, { label: string; blurb: string; prompts: string[] }> = {
  morning: {
    label: "Morning",
    blurb: "Set the standard before the day sets it for you.",
    prompts: [
      "What does a successful day look like?",
      "What are today's three non-negotiables?",
      "What could derail me, and how do I handle it?",
    ],
  },
  daily: {
    label: "Daily",
    blurb: "The honest record of a day.",
    prompts: [
      "What happened today?",
      "What did I accomplish?",
      "What went wrong?",
      "What did I learn?",
      "What am I grateful for?",
      "What needs to change tomorrow?",
    ],
  },
  night: {
    label: "Night review",
    blurb: "Close the loop.",
    prompts: [
      "Did I do what I said I would do?",
      "Where did my time actually go?",
      "What am I carrying into tomorrow?",
    ],
  },
  free: { label: "Free write", blurb: "Just write.", prompts: [] },
};

export default function JournalPage() {
  const entries = useResource<JournalEntry[]>("/api/journal");
  const [type, setType] = useState<JournalType>("daily");
  const [active, setActive] = useState<JournalEntry | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const today = dayKey();
  const todayEntry = useMemo(
    () => (entries.data ?? []).find((entry) => entry.date === today && entry.type === type) ?? null,
    [entries.data, today, type],
  );

  const entry = active ?? todayEntry;
  const entryKey = entry?.id ?? `blank:${type}`;
  const [syncedKey, setSyncedKey] = useState<string | null>(null);

  if (syncedKey !== entryKey) {
    setSyncedKey(entryKey);
    setTitle(entry?.title ?? "");
    setBody(entry?.body ?? "");
    setAnswers(parseAnswers(entry?.answers));
  }

  async function save() {
    const payload = {
      type,
      date: active?.date ?? today,
      title: title || null,
      body,
      answers: JSON.stringify(answers),
    };
    const existing = active ?? todayEntry;
    if (existing) await api(`/api/journal/${existing.id}`, { method: "PATCH", body: payload });
    else await api("/api/journal", { method: "POST", body: payload });
    setSaved(format(new Date(), "HH:mm"));
    await entries.reload();
  }

  async function remove(id: string) {
    await api(`/api/journal/${id}`, { method: "DELETE" });
    setActive(null);
    await entries.reload();
  }

  const template = templates[type];

  return (
    <div className="space-y-7">
      <header className="rise">
        <p className="eyebrow">Reflection</p>
        <h1 className="display mt-3 text-4xl">Journal</h1>
        <p className="mt-3 max-w-lg text-muted">{template.blurb}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(templates) as JournalType[]).map((value) => (
          <button
            key={value}
            onClick={() => {
              setType(value);
              setActive(null);
            }}
            className={cx(
              "rounded-full border px-4 py-1.5 text-xs transition-colors",
              type === value
                ? "border-[rgba(200,163,90,0.5)] bg-[rgba(200,163,90,0.12)] text-[var(--accent)]"
                : "border-[var(--line)] text-muted hover:text-fg",
            )}
          >
            {templates[value].label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <div className="eyebrow">
              {active ? format(new Date(active.date), "EEEE d MMMM") : format(new Date(), "EEEE d MMMM")}
            </div>
            {saved ? <span className="text-[11px] text-faint">Saved {saved}</span> : null}
          </div>

          <div className="mt-4">
            <Input value={title} onChange={setTitle} placeholder="Title (optional)" />
          </div>

          <div className="mt-5 space-y-5">
            {template.prompts.map((prompt) => (
              <div key={prompt}>
                <p className="display text-lg text-fg">{prompt}</p>
                <div className="mt-2">
                  <Textarea
                    rows={3}
                    value={answers[prompt] ?? ""}
                    onChange={(value) => setAnswers({ ...answers, [prompt]: value })}
                    placeholder="Be honest — no one else reads this."
                  />
                </div>
              </div>
            ))}
            <div>
              {template.prompts.length ? <p className="eyebrow mb-2">Anything else</p> : null}
              <Textarea rows={template.prompts.length ? 4 : 14} value={body} onChange={setBody} placeholder="Just write." />
            </div>
          </div>

          <div className="mt-5 flex justify-between">
            {active ? (
              <Button variant="danger" onClick={() => remove(active.id)}>
                <Icon name="trash" size={14} /> Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              {active ? (
                <Button variant="ghost" onClick={() => setActive(null)}>
                  New entry
                </Button>
              ) : null}
              <Button variant="primary" onClick={save}>
                Save entry
              </Button>
            </div>
          </div>
        </Panel>

        <Panel className="h-fit p-5">
          <div className="eyebrow">Past entries</div>
          <div className="mt-4 space-y-1">
            {(entries.data ?? []).length === 0 ? (
              <EmptyState title="Nothing written yet" />
            ) : (
              (entries.data ?? []).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setType(entry.type);
                    setActive(entry);
                  }}
                  className={cx(
                    "w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/4",
                    active?.id === entry.id && "bg-white/6",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-faint">
                      {format(new Date(entry.date), "d MMM yyyy")}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--accent)]">
                      {entry.type}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-sm">
                    {entry.title || entry.body.slice(0, 60) || "Untitled"}
                  </div>
                </button>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
