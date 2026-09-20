"use client";

import { useState } from "react";
import { format } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import type { Note } from "@/lib/types";
import { Button, EmptyState, Input, Panel, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

const kinds = ["note", "idea", "book", "course", "resource"] as const;

export default function NotesPage() {
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (query) params.set("q", query);
  const notes = useResource<Note[]>(`/api/notes?${params.toString()}`);
  const [active, setActive] = useState<Note | null>(null);
  const [draft, setDraft] = useState<{ title: string; body: string; kind: string; tags: string }>({
    title: "",
    body: "",
    kind: "note",
    tags: "",
  });

  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (active && active.id !== syncedId) {
    setSyncedId(active.id);
    setDraft({ title: active.title, body: active.body, kind: active.kind, tags: active.tags });
  }

  async function save() {
    if (!draft.title.trim()) return;
    if (active) await api(`/api/notes/${active.id}`, { method: "PATCH", body: draft });
    else {
      const created = await api<Note>("/api/notes", { method: "POST", body: draft });
      setActive(created);
    }
    await notes.reload();
  }

  async function remove(id: string) {
    await api(`/api/notes/${id}`, { method: "DELETE" });
    setActive(null);
    setDraft({ title: "", body: "", kind: "note", tags: "" });
    await notes.reload();
  }

  async function togglePin(note: Note) {
    await api(`/api/notes/${note.id}`, { method: "PATCH", body: { pinned: !note.pinned } });
    await notes.reload();
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="eyebrow">Second brain</p>
          <h1 className="display mt-3 text-4xl">Notes</h1>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setActive(null);
            setDraft({ title: "", body: "", kind: "note", tags: "" });
          }}
        >
          <Icon name="plus" size={14} /> New note
        </Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <Panel className="flex items-center gap-2 px-3 py-2">
            <Icon name="search" size={15} className="text-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-faint"
            />
          </Panel>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setKind("")}
              className={cx(
                "rounded-full border px-3 py-1 text-[11px]",
                kind === "" ? "border-[rgba(200,163,90,0.5)] text-[var(--accent)]" : "border-[var(--line)] text-muted",
              )}
            >
              all
            </button>
            {kinds.map((value) => (
              <button
                key={value}
                onClick={() => setKind(value)}
                className={cx(
                  "rounded-full border px-3 py-1 text-[11px]",
                  kind === value ? "border-[rgba(200,163,90,0.5)] text-[var(--accent)]" : "border-[var(--line)] text-muted",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <Panel className="max-h-[560px] overflow-y-auto p-2">
            {(notes.data ?? []).length === 0 ? (
              <div className="p-3">
                <EmptyState title="No notes" hint="Capture ideas before they evaporate." />
              </div>
            ) : (
              (notes.data ?? []).map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActive(note)}
                  className={cx(
                    "w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/4",
                    active?.id === note.id && "bg-white/6",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm">{note.title}</span>
                    {note.pinned ? <span className="text-[10px] text-[var(--accent)]">pinned</span> : null}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-faint">
                    <span>{note.kind}</span>
                    <span>{format(new Date(note.updatedAt), "d MMM")}</span>
                  </div>
                </button>
              ))
            )}
          </Panel>
        </div>

        <Panel className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Untitled"
              className="display min-w-0 flex-1 bg-transparent text-3xl outline-none placeholder:text-faint"
            />
            <Select
              value={draft.kind}
              onChange={(value) => setDraft({ ...draft, kind: value })}
              options={kinds.map((value) => ({ value, label: value }))}
            />
          </div>
          <div className="mt-3">
            <Input value={draft.tags} onChange={(value) => setDraft({ ...draft, tags: value })} placeholder="tags, comma, separated" />
          </div>
          <div className="mt-4">
            <Textarea
              rows={18}
              value={draft.body}
              onChange={(value) => setDraft({ ...draft, body: value })}
              placeholder="Write it down. Your memory is not a database."
            />
          </div>
          <div className="mt-4 flex justify-between">
            {active ? (
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => remove(active.id)}>
                  <Icon name="trash" size={14} /> Delete
                </Button>
                <Button variant="ghost" onClick={() => togglePin(active)}>
                  {active.pinned ? "Unpin" : "Pin"}
                </Button>
              </div>
            ) : (
              <span />
            )}
            <Button variant="primary" onClick={save}>
              {active ? "Save changes" : "Create note"}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
