"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";
import { api, cx } from "@/lib/client";

const nav = [
  { href: "/dashboard", label: "Command Center", icon: "home" },
  { href: "/planner", label: "Planner", icon: "planner" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/tasks", label: "Tasks", icon: "tasks" },
  { href: "/goals", label: "Goals", icon: "goals" },
  { href: "/habits", label: "Habits", icon: "habits" },
  { href: "/journal", label: "Journal", icon: "journal" },
  { href: "/finance", label: "Finance", icon: "finance" },
  { href: "/notes", label: "Notes", icon: "notes" },
  { href: "/reviews", label: "Reviews", icon: "reviews" },
];

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[var(--line)] bg-[#08090b]/80 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(200,163,90,0.45)] bg-[rgba(200,163,90,0.1)]">
          <span className="display text-base text-[var(--accent)]">5</span>
        </div>
        <div className="leading-tight">
          <div className="display text-lg tracking-tight">THE5P</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-faint">
            Prepare · Perform
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "bg-white/6 text-fg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-muted hover:bg-white/4 hover:text-fg",
              )}
            >
              <Icon
                name={item.icon}
                size={17}
                className={active ? "text-[var(--accent)]" : "text-faint group-hover:text-muted"}
              />
              {item.label}
              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-1 border-t border-[var(--line)] pt-4">
        <Link
          href="/settings"
          className={cx(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            pathname === "/settings" ? "bg-white/6 text-fg" : "text-muted hover:text-fg",
          )}
        >
          <Icon name="settings" size={17} className="text-faint" />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line-strong)] text-xs text-muted">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-xs text-fg">{name}</div>
            <div className="truncate text-[10px] text-faint">{email}</div>
          </div>
          <button
            onClick={logout}
            disabled={busy}
            title="Sign out"
            className="text-faint transition-colors hover:text-[var(--danger)]"
          >
            <Icon name="logout" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-[var(--line)] bg-[#08090b]/90 px-3 py-2 backdrop-blur-xl lg:hidden">
      {[...nav, { href: "/settings", label: "Settings", icon: "settings" }].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cx(
            "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
            pathname === item.href ? "bg-white/8 text-fg" : "text-muted",
          )}
        >
          <Icon name={item.icon} size={14} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
