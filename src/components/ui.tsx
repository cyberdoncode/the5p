"use client";

import { useEffect, type ReactNode } from "react";
import { cx } from "@/lib/client";

export function Panel({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={cx("panel relative", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <div className="eyebrow mb-2">{eyebrow}</div> : null}
        <h2 className="display text-2xl text-fg">{title}</h2>
      </div>
      {action}
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "outline",
  size = "md",
  disabled,
  className,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";
  const sizes = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants = {
    primary:
      "bg-[var(--accent)] text-black hover:brightness-110 shadow-[0_8px_30px_-12px_rgba(200,163,90,0.8)]",
    outline:
      "border border-[var(--line-strong)] text-fg hover:bg-white/5 hover:border-white/25",
    ghost: "text-muted hover:text-fg hover:bg-white/5",
    danger: "border border-[rgba(224,108,117,0.4)] text-[var(--danger)] hover:bg-[rgba(224,108,117,0.1)]",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(base, sizes, variants, className)}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  onEnter,
  autoFocus,
  min,
  step,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  onEnter?: () => void;
  autoFocus?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && onEnter) onEnter();
      }}
      className={cx(
        "w-full rounded-xl border border-[var(--line)] bg-black/30 px-3.5 py-2.5 text-sm text-fg outline-none transition-colors focus:border-[rgba(200,163,90,0.55)] focus:bg-black/50",
        className,
      )}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 5,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cx(
        "w-full resize-y rounded-xl border border-[var(--line)] bg-black/30 px-3.5 py-3 text-sm leading-relaxed text-fg outline-none transition-colors focus:border-[rgba(200,163,90,0.55)] focus:bg-black/50",
        className,
      )}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cx(
        "rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2.5 text-sm text-fg outline-none focus:border-[rgba(200,163,90,0.55)]",
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#0d0f11]">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger";
}) {
  const tones = {
    neutral: "border-[var(--line-strong)] text-muted",
    accent: "border-[rgba(200,163,90,0.35)] text-[var(--accent)] bg-[rgba(200,163,90,0.08)]",
    ok: "border-[rgba(78,201,165,0.3)] text-[var(--ok)] bg-[rgba(78,201,165,0.08)]",
    warn: "border-[rgba(224,164,88,0.3)] text-[var(--warn)] bg-[rgba(224,164,88,0.08)]",
    danger: "border-[rgba(224,108,117,0.3)] text-[var(--danger)] bg-[rgba(224,108,117,0.08)]",
  }[tone];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        tones,
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, tone = "accent" }: { value: number; tone?: "accent" | "ok" }) {
  const color = tone === "ok" ? "var(--ok)" : "var(--accent)";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.65))`,
        }}
      />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[var(--line)] px-6 py-10 text-center">
      <p className="text-sm text-muted">{title}</p>
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-16 backdrop-blur-sm">
      <div className="w-full max-w-lg rise">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="display text-xl">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs text-muted hover:text-fg"
            >
              Esc
            </button>
          </div>
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="eyebrow">{label}</span>
      <div>{children}</div>
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  size = 18,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cx(
        "flex shrink-0 items-center justify-center rounded-md border transition-all duration-200",
        checked
          ? "border-[var(--accent)] bg-[var(--accent)] text-black"
          : "border-[var(--line-strong)] text-transparent hover:border-white/35",
      )}
      style={{ width: size, height: size }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
