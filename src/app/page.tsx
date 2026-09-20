import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserId } from "@/lib/auth";

const pillars = [
  { word: "Proper", copy: "A command center that answers one question: what needs to happen today for today to count?" },
  { word: "Preparation", copy: "Goals become projects, projects become milestones, milestones become tasks you can check off." },
  { word: "Prevents", copy: "Habits, reviews and journals that build consistency over perfection — never streak shame." },
  { word: "Poor Performance", copy: "Finance, notes and weekly reviews so nothing about your life runs on memory." },
];

export default async function Landing() {
  if (await getUserId()) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="glow" style={{ top: "-160px", left: "20%", width: "620px", height: "360px", background: "rgba(200,163,90,0.22)" }} />
      <div className="glow" style={{ bottom: "-240px", right: "10%", width: "520px", height: "340px", background: "rgba(90,130,200,0.16)" }} />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(200,163,90,0.45)] bg-[rgba(200,163,90,0.1)]">
            <span className="display text-base text-[var(--accent)]">5</span>
          </div>
          <span className="display text-xl">THE5P</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black shadow-[0_10px_40px_-14px_rgba(200,163,90,0.9)] transition hover:brightness-110"
          >
            Create your system
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
        <p className="eyebrow rise">Personal operating system</p>
        <h1 className="display rise mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">
          Proper Preparation
          <br />
          Prevents <span className="italic text-[var(--accent)]">Poor Performance</span>.
        </h1>
        <p className="rise mt-7 max-w-xl text-base leading-relaxed text-muted">
          THE5P is one quiet, deliberate place for your day, your goals, your habits, your money
          and your thinking. Built to feel expensive — and to be used every single morning.
        </p>
        <div className="rise mt-9 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-black transition hover:brightness-110"
          >
            Start today
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-sm transition hover:bg-white/5"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-24 grid gap-px overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.word} className="bg-[#0a0b0d] p-8">
              <div className="display text-2xl text-[var(--accent)]">{pillar.word}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-faint">
          {["Command Center", "Planner", "Calendar", "Tasks", "Goals", "Habits", "Journal", "Finance", "Notes", "Reviews"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
