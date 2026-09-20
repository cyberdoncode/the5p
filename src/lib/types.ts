export type Task = {
  id: string;
  title: string;
  notes: string | null;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string | null;
  scheduledAt: string | null;
  estimate: number | null;
  recurrence: string | null;
  completedAt: string | null;
  projectId: string | null;
  milestoneId: string | null;
  order: number;
  createdAt: string;
  project?: { id: string; name: string; color: string } | null;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  dueDate: string | null;
  order: number;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "paused" | "done";
  color: string;
  goalId: string | null;
  dueDate: string | null;
  milestones: Milestone[];
  tasks: Array<{ id: string; status: string }>;
  goal?: { id: string; title: string } | null;
};

export type Goal = {
  id: string;
  title: string;
  why: string | null;
  horizon: "quarter" | "year" | "life";
  targetDate: string | null;
  status: "active" | "achieved" | "archived";
  progress: number;
  projects: Project[];
};

export type Habit = {
  id: string;
  name: string;
  cue: string | null;
  cadence: "daily" | "weekdays" | "weekly";
  targetPerWeek: number;
  color: string;
  icon: string;
  archived: boolean;
  logs?: HabitLog[];
};

export type HabitLog = { id: string; habitId: string; date: string; done: boolean };

export type JournalEntry = {
  id: string;
  type: "daily" | "morning" | "night" | "free";
  date: string;
  title: string | null;
  body: string;
  answers: string;
  mood: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  notes: string | null;
  start: string;
  end: string;
  allDay: boolean;
  category: "focus" | "meeting" | "personal" | "health" | "admin";
  color: string;
};

export type Expense = {
  id: string;
  kind: "income" | "expense" | "saving" | "debt";
  label: string;
  amount: number;
  category: string;
  date: string;
  recurring: boolean;
};

export type Budget = { id: string; category: string; monthly: number };

export type Note = {
  id: string;
  title: string;
  body: string;
  kind: "note" | "idea" | "book" | "course" | "resource";
  tags: string;
  pinned: boolean;
  updatedAt: string;
};

export type Review = {
  id: string;
  period: "weekly" | "monthly" | "yearly";
  periodKey: string;
  answers: string;
  updatedAt: string;
};

export type Priority = {
  id: string;
  date: string;
  slot: number;
  taskId: string | null;
  text: string;
  done: boolean;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  weekStart: string;
  currency: string;
  accent: string;
};

export type DashboardData = {
  today: string;
  priorities: Priority[];
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  habitLogs: HabitLog[];
  journalToday: JournalEntry | null;
  upcoming: Task[];
  weeklyReview: Review | null;
  goals: Goal[];
  stats: { doneThisWeek: number; createdThisWeek: number };
};
