import { z } from "zod";

const nullableDate = z.union([z.coerce.date(), z.null()]).optional();

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).nullish(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  dueDate: nullableDate,
  scheduledAt: nullableDate,
  estimate: z.number().int().min(0).max(1440).nullish(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).nullish(),
  projectId: z.string().nullish(),
  milestoneId: z.string().nullish(),
  order: z.number().int().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  completedAt: nullableDate,
});

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).nullish(),
  status: z.enum(["active", "paused", "done"]).optional(),
  color: z.string().max(20).optional(),
  goalId: z.string().nullish(),
  dueDate: nullableDate,
});
export const projectUpdateSchema = projectCreateSchema.partial();

export const goalCreateSchema = z.object({
  title: z.string().min(1).max(200),
  why: z.string().max(2000).nullish(),
  horizon: z.enum(["quarter", "year", "life"]).optional(),
  targetDate: nullableDate,
  status: z.enum(["active", "achieved", "archived"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});
export const goalUpdateSchema = goalCreateSchema.partial();

export const milestoneCreateSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  dueDate: nullableDate,
  order: z.number().int().optional(),
});
export const milestoneUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  done: z.boolean().optional(),
  dueDate: nullableDate,
  order: z.number().int().optional(),
});

export const habitCreateSchema = z.object({
  name: z.string().min(1).max(120),
  cue: z.string().max(200).nullish(),
  cadence: z.enum(["daily", "weekdays", "weekly"]).optional(),
  targetPerWeek: z.number().int().min(1).max(7).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(40).optional(),
  archived: z.boolean().optional(),
});
export const habitUpdateSchema = habitCreateSchema.partial();

export const habitLogSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  done: z.boolean(),
});

export const journalCreateSchema = z.object({
  type: z.enum(["daily", "morning", "night", "free"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(200).nullish(),
  body: z.string().max(50000).optional(),
  answers: z.string().optional(),
  mood: z.number().int().min(1).max(5).nullish(),
});
export const journalUpdateSchema = journalCreateSchema.partial();

export const eventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).nullish(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  allDay: z.boolean().optional(),
  category: z.enum(["focus", "meeting", "personal", "health", "admin"]).optional(),
  color: z.string().max(20).optional(),
});
export const eventUpdateSchema = eventCreateSchema.partial();

export const expenseCreateSchema = z.object({
  kind: z.enum(["income", "expense", "saving", "debt"]).optional(),
  label: z.string().min(1).max(160),
  amount: z.number(),
  category: z.string().max(60).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurring: z.boolean().optional(),
});
export const expenseUpdateSchema = expenseCreateSchema.partial();

export const noteCreateSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(100000).optional(),
  kind: z.enum(["note", "idea", "book", "course", "resource"]).optional(),
  tags: z.string().max(300).optional(),
  pinned: z.boolean().optional(),
});
export const noteUpdateSchema = noteCreateSchema.partial();

export const reviewUpsertSchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]),
  periodKey: z.string().min(4).max(12),
  answers: z.string(),
});

export const prioritiesUpsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z
    .array(
      z.object({
        slot: z.number().int().min(1).max(5),
        text: z.string().max(200),
        done: z.boolean(),
        taskId: z.string().nullish(),
      }),
    )
    .max(5),
});

export const budgetUpsertSchema = z.object({
  category: z.string().min(1).max(60),
  monthly: z.number().min(0),
});

export const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const settingsSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  timezone: z.string().max(64).optional(),
  weekStart: z.enum(["monday", "sunday"]).optional(),
  currency: z.string().min(1).max(8).optional(),
  accent: z.enum(["gold", "ice", "ember", "mint"]).optional(),
});
