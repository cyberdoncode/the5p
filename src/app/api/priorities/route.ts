import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { prioritiesUpsertSchema } from "@/lib/schemas";
import { dayKey } from "@/lib/dates";

export async function GET(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const date = request.nextUrl.searchParams.get("date") ?? dayKey();
    return prisma.dailyPriority.findMany({
      where: { userId, date },
      orderBy: { slot: "asc" },
    });
  });
}

export async function PUT(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { date, items } = prioritiesUpsertSchema.parse(await request.json());
    await prisma.$transaction(
      items.map((item) =>
        prisma.dailyPriority.upsert({
          where: { userId_date_slot: { userId, date, slot: item.slot } },
          create: { userId, date, slot: item.slot, text: item.text, done: item.done, taskId: item.taskId ?? null },
          update: { text: item.text, done: item.done, taskId: item.taskId ?? null },
        }),
      ),
    );
    return prisma.dailyPriority.findMany({ where: { userId, date }, orderBy: { slot: "asc" } });
  });
}
