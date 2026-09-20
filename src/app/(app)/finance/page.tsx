"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { api, cx, money, useResource } from "@/lib/client";
import { dayKey, monthKey } from "@/lib/dates";
import type { Budget, CurrentUser, Expense } from "@/lib/types";
import { Badge, Button, EmptyState, Field, Input, Modal, Panel, Progress, Select } from "@/components/ui";
import { Icon } from "@/components/icons";

const kinds = ["income", "expense", "saving", "debt"] as const;
const categories = ["housing", "food", "transport", "tools", "health", "learning", "fun", "family", "general"];

export default function FinancePage() {
  const [month, setMonth] = useState(new Date());
  const key = monthKey(month);
  const expenses = useResource<Expense[]>(`/api/expenses?month=${key}`);
  const budgets = useResource<Budget[]>("/api/budgets");
  const me = useResource<{ user: CurrentUser | null }>("/api/me");
  const currency = me.data?.user?.currency ?? "USD";

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    kind: "expense",
    label: "",
    amount: "",
    category: "general",
    date: dayKey(),
    recurring: false,
  });

  const totals = useMemo(() => {
    const rows = expenses.data ?? [];
    const sum = (kind: string) =>
      rows.filter((row) => row.kind === kind).reduce((total, row) => total + row.amount, 0);
    const income = sum("income");
    const spend = sum("expense");
    const saving = sum("saving");
    const debt = sum("debt");
    return { income, spend, saving, debt, net: income - spend - saving - debt };
  }, [expenses.data]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of expenses.data ?? []) {
      if (row.kind !== "expense") continue;
      map.set(row.category, (map.get(row.category) ?? 0) + row.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses.data]);

  async function create() {
    if (!form.label.trim() || !form.amount) return;
    await api("/api/expenses", {
      method: "POST",
      body: {
        kind: form.kind,
        label: form.label,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        recurring: form.recurring,
      },
    });
    setForm({ ...form, label: "", amount: "" });
    setOpen(false);
    await expenses.reload();
  }

  async function remove(id: string) {
    await api(`/api/expenses/${id}`, { method: "DELETE" });
    await expenses.reload();
  }

  async function setBudget(category: string) {
    const value = window.prompt(`Monthly budget for ${category}`);
    if (!value) return;
    await api("/api/budgets", { method: "PUT", body: { category, monthly: Number(value) } });
    await budgets.reload();
  }

  const maxCategory = byCategory[0]?.[1] ?? 1;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="eyebrow">Private</p>
          <h1 className="display mt-3 text-4xl">Where my money is going</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setMonth(addMonths(month, -1))}>
            <Icon name="chevronLeft" size={16} />
          </Button>
          <span className="min-w-[120px] text-center font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {format(month, "MMMM yyyy")}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setMonth(addMonths(month, 1))}>
            <Icon name="chevronRight" size={16} />
          </Button>
          <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
            <Icon name="plus" size={14} /> Entry
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Income", value: totals.income, tone: "ok" as const },
          { label: "Spent", value: totals.spend, tone: "danger" as const },
          { label: "Saved", value: totals.saving, tone: "accent" as const },
          { label: "Left over", value: totals.net, tone: totals.net >= 0 ? ("ok" as const) : ("danger" as const) },
        ].map((card) => (
          <Panel key={card.label} className="p-5">
            <div className="eyebrow">{card.label}</div>
            <div
              className={cx(
                "display mt-3 text-3xl",
                card.tone === "ok" && "text-[var(--ok)]",
                card.tone === "danger" && "text-[var(--danger)]",
                card.tone === "accent" && "text-[var(--accent)]",
              )}
            >
              {money(card.value, currency)}
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel className="p-6">
          <div className="eyebrow">Breakdown</div>
          <div className="mt-5 space-y-4">
            {byCategory.length === 0 ? (
              <EmptyState title="No spending logged" hint="Add your first entry." />
            ) : (
              byCategory.map(([category, amount]) => {
                const budget = (budgets.data ?? []).find((row) => row.category === category);
                return (
                  <div key={category}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span className="font-mono text-xs text-muted">
                        {money(amount, currency)}
                        {budget ? ` / ${money(budget.monthly, currency)}` : ""}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={budget ? (amount / budget.monthly) * 100 : (amount / maxCategory) * 100}
                        tone={budget && amount > budget.monthly ? "accent" : "ok"}
                      />
                    </div>
                    <button
                      onClick={() => setBudget(category)}
                      className="mt-1 text-[10px] uppercase tracking-[0.15em] text-faint hover:text-fg"
                    >
                      {budget ? "adjust budget" : "set budget"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="eyebrow">This month</div>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {(expenses.data ?? []).length === 0 ? (
              <EmptyState title="Nothing logged yet" />
            ) : (
              (expenses.data ?? []).map((row) => (
                <div key={row.id} className="group flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm">{row.label}</div>
                    <div className="font-mono text-[11px] text-faint">
                      {format(new Date(row.date), "d MMM")} · {row.category}
                      {row.recurring ? " · recurring" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cx(
                        "font-mono text-sm",
                        row.kind === "income" ? "text-[var(--ok)]" : "text-fg",
                      )}
                    >
                      {row.kind === "income" ? "+" : "−"}
                      {money(row.amount, currency)}
                    </span>
                    <button onClick={() => remove(row.id)} className="text-faint opacity-0 transition group-hover:opacity-100 hover:text-[var(--danger)]">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New entry">
        <div className="flex flex-wrap gap-2">
          {kinds.map((kind) => (
            <button
              key={kind}
              onClick={() => setForm({ ...form, kind })}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs capitalize",
                form.kind === kind
                  ? "border-[rgba(200,163,90,0.5)] bg-[rgba(200,163,90,0.12)] text-[var(--accent)]"
                  : "border-[var(--line)] text-muted",
              )}
            >
              {kind}
            </button>
          ))}
        </div>
        <Field label="Label">
          <Input value={form.label} onChange={(value) => setForm({ ...form, label: value })} autoFocus placeholder="Rent, groceries, client payment…" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Amount">
            <Input type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
          </Field>
          <Field label="Category">
            <Select
              className="w-full"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={categories.map((value) => ({ value, label: value }))}
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
          </Field>
        </div>
        <button
          onClick={() => setForm({ ...form, recurring: !form.recurring })}
          className="flex items-center gap-2 text-xs text-muted"
        >
          <span className={cx("h-4 w-4 rounded border", form.recurring ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--line-strong)]")} />
          Recurring every month
        </button>
        <div className="flex items-center justify-between pt-1">
          <Badge>{form.kind}</Badge>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={create}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
