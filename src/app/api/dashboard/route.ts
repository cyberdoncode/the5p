import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { dayKey, lastNDays, weekKey, weekRange } from "@/lib/dates";
import { endOfDay, startOfDay, addDays } from "date-fns";

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    const now = new Date();
    const today = dayKey(now);
    const { start: weekStart, end: weekEnd } = weekRange(now);

    const [
      priorities,
      tasks,
      events,
      habits,
      habitLogs,
      journalToday,
      upcoming,
      weeklyReview,
      goals,
    ] = await Promise.all([
      prisma.dailyPriority.findMany({ where: { userId, date: today }, orderBy: { slot: "asc" } }),
      prisma.task.findMany({
        where: {
          userId,
          status: { not: "done" },
          OR: [
            { dueDate: { lte: endOfDay(now) } },
            { scheduledAt: { gte: startOfDay(now), lte: endOfDay(now) } },
          ],
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        include: { project: { select: { id: true, name: true, color: true } } },
        take: 25,
      }),
      prisma.calendarEvent.findMany({
        where: { userId, start: { gte: startOfDay(now), lte: endOfDay(now) } },
        orderBy: { start: "asc" },
      }),
      prisma.habit.findMany({ where: { userId, archived: false }, orderBy: { createdAt: "asc" } }),
      prisma.habitLog.findMany({
        where: { userId, date: { in: lastNDays(28, now).map((d) => dayKey(d)) } },
      }),
      prisma.journalEntry.findFirst({ where: { userId, date: today }, orderBy: { createdAt: "desc" } }),
      prisma.task.findMany({
        where: { userId, status: { not: "done" }, dueDate: { gt: endOfDay(now), lte: addDays(now, 14) } },
        orderBy: { dueDate: "asc" },
        take: 8,
        include: { project: { select: { name: true, color: true } } },
      }),
      prisma.review.findFirst({ where: { userId, period: "weekly", periodKey: weekKey(now) } }),
      prisma.goal.findMany({
        where: { userId, status: "active" },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { projects: { include: { tasks: { select: { status: true } } } } },
      }),
    ]);

    const [doneThisWeek, createdThisWeek] = await Promise.all([
      prisma.task.count({
        where: { userId, status: "done", updatedAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.task.count({ where: { userId, createdAt: { gte: weekStart, lte: weekEnd } } }),
    ]);

    return {
      today,
      priorities,
      tasks,
      events,
      habits,
      habitLogs,
      journalToday,
      upcoming,
      weeklyReview,
      goals,
      stats: { doneThisWeek, createdThisWeek },
    };
  });
}
