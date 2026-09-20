"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, useResource } from "@/lib/client";
import type { CurrentUser } from "@/lib/types";
import { Button, Field, Input, Panel, Select } from "@/components/ui";

export default function SettingsPage() {
  const router = useRouter();
  const me = useResource<{ user: CurrentUser | null }>("/api/me");
  const [form, setForm] = useState({ name: "", timezone: "UTC", weekStart: "monday", currency: "USD" });
  const [saved, setSaved] = useState(false);

  const user = me.data?.user ?? null;
  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (user && user.id !== syncedId) {
    setSyncedId(user.id);
    setForm({
      name: user.name,
      timezone: user.timezone,
      weekStart: user.weekStart,
      currency: user.currency,
    });
  }

  async function save() {
    await api("/api/me", { method: "PATCH", body: form });
    setSaved(true);
    await me.reload();
    router.refresh();
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-7">
      <header className="rise">
        <p className="eyebrow">Your system</p>
        <h1 className="display mt-3 text-4xl">Settings</h1>
      </header>

      <Panel className="max-w-xl p-6">
        <div className="eyebrow">Profile</div>
        <div className="mt-5 space-y-4">
          <Field label="Name">
            <Input value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          </Field>
          <Field label="Email">
            <Input value={me.data?.user?.email ?? ""} onChange={() => {}} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Week starts">
              <Select
                className="w-full"
                value={form.weekStart}
                onChange={(value) => setForm({ ...form, weekStart: value })}
                options={[
                  { value: "monday", label: "Monday" },
                  { value: "sunday", label: "Sunday" },
                ]}
              />
            </Field>
            <Field label="Currency">
              <Select
                className="w-full"
                value={form.currency}
                onChange={(value) => setForm({ ...form, currency: value })}
                options={["USD", "EUR", "GBP", "NGN", "CAD", "AUD", "ZAR", "KES"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Field>
            <Field label="Timezone">
              <Input value={form.timezone} onChange={(value) => setForm({ ...form, timezone: value })} />
            </Field>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" onClick={save}>
              Save changes
            </Button>
            {saved ? <span className="text-xs text-[var(--ok)]">Saved</span> : null}
          </div>
        </div>
      </Panel>

      <Panel className="max-w-xl p-6">
        <div className="eyebrow">Session</div>
        <p className="mt-3 text-sm text-muted">Signed in as {me.data?.user?.email}</p>
        <div className="mt-4">
          <Button variant="danger" onClick={logout}>
            Sign out
          </Button>
        </div>
      </Panel>
    </div>
  );
}
