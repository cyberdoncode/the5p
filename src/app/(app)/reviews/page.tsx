"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import { monthKey, weekKey, yearKey } from "@/lib/dates";
import type { Review } from "@/lib/types";
import { Button, EmptyState, Panel, Textarea, Input } from "@/components/ui";

type Period = "weekly" | "monthly" | "yearly";

function parseAnswers(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

const questions: Record<Period, string[]> = {
  weekly: [
    "What did I accomplish?",
    "What didn't get done?",
    "Why?",
    "What did I learn?",
    "What should I stop doing?",
    "What should I start doing?",
  ],
  monthly: [
    "What moved forward this month?",
    "What stalled, and what was the real reason?",
    "What did this month teach me?",
    "What am I cutting next month?",
  ],
  yearly: [
    "What defined this year?",
    "What am I proud of?",
    "What did I avoid?",
    "Who did I become?",
    "What is next year's single theme?",
  ],
};

export default function ReviewsPage() {
  const [period, setPeriod] = useState<Period>("weekly");
  const reviews = useResource<Review[]>(`/api/reviews?period=${period}`);
  const currentKey = period === "weekly" ? weekKey() : period === "monthly" ? monthKey() : yearKey();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [objective, setObjective] = useState("");
  const [priorities, setPriorities] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const current = useMemo(
    () => (reviews.data ?? []).find((review) => review.periodKey === currentKey) ?? null,
    [reviews.data, currentKey],
  );

  const currentId = current?.id ?? `blank:${period}:${currentKey}`;
  const [syncedId, setSyncedId] = useState<string | null>(null);

  if (syncedId !== currentId) {
    const parsed = parseAnswers(current?.answers);
    setSyncedId(currentId);
    setAnswers(parsed);
    setObjective(parsed.objective ?? "");
    setPriorities(parsed.priorities ?? "");
  }

  async function save() {
    await api("/api/reviews", {
      method: "PUT",
      body: {
        period,
        periodKey: currentKey,
        answers: JSON.stringify({ ...answers, objective, priorities }),
      },
    });
    setSaved(format(new Date(), "HH:mm"));
    await reviews.reload();
  }

  return (
    <div className="space-y-7">
      <header className="rise">
        <p className="eyebrow">Accountability</p>
        <h1 className="display mt-3 text-4xl">Review system</h1>
        <p className="mt-3 max-w-lg text-muted">
          A planner tells you what to do. A review tells you the truth about what you did.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["weekly", "monthly", "yearly"] as Period[]).map((value) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={cx(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              period === value
                ? "border-[rgba(200,163,90,0.5)] bg-[rgba(200,163,90,0.12)] text-[var(--accent)]"
                : "border-[var(--line)] text-muted hover:text-fg",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{currentKey}</div>
            {saved ? <span className="text-[11px] text-faint">Saved {saved}</span> : null}
          </div>

          {period === "weekly" ? (
            <div className="mt-5 space-y-4 rounded-2xl border border-[rgba(200,163,90,0.28)] bg-[rgba(200,163,90,0.06)] p-5">
              <div>
                <p className="eyebrow mb-2">This week&apos;s objective</p>
                <Input value={objective} onChange={setObjective} placeholder="The one outcome that defines the week" />
              </div>
              <div>
                <p className="eyebrow mb-2">Next week&apos;s 5 priorities</p>
                <Textarea rows={5} value={priorities} onChange={setPriorities} placeholder={"1.\n2.\n3.\n4.\n5."} />
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            {questions[period].map((question) => (
              <div key={question}>
                <p className="display text-lg">{question}</p>
                <div className="mt-2">
                  <Textarea
                    rows={3}
                    value={answers[question] ?? ""}
                    onChange={(value) => setAnswers({ ...answers, [question]: value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={save}>
              Save review
            </Button>
          </div>
        </Panel>

        <Panel className="h-fit p-5">
          <div className="eyebrow">Past reviews</div>
          <div className="mt-4 space-y-1">
            {(reviews.data ?? []).length === 0 ? (
              <EmptyState title="No reviews yet" hint="Sunday is a good day to start." />
            ) : (
              (reviews.data ?? []).map((review) => (
                <div key={review.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/4">
                  <span className="font-mono text-xs">{review.periodKey}</span>
                  <span className="text-[11px] text-faint">
                    {format(new Date(review.updatedAt), "d MMM")}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
