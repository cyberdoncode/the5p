import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { habitLogSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { habitId, date, done } = habitLogSchema.parse(await request.json());
    const habit = await prisma.habit.findFirst({ where: { id: habitId, userId }, select: { id: true } });
    if (!habit) throw new Error("Habit not found");

    if (!done) {
      await prisma.habitLog.deleteMany({ where: { habitId, date } });
      return { habitId, date, done: false };
    }
    await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date } },
      create: { habitId, date, userId, done: true },
      update: { done: true },
    });
    return { habitId, date, done: true };
  });
}
