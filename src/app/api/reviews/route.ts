import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { reviewUpsertSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const period = request.nextUrl.searchParams.get("period");
    return prisma.review.findMany({
      where: { userId, ...(period ? { period } : {}) },
      orderBy: { periodKey: "desc" },
      take: 60,
    });
  });
}

export async function PUT(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { period, periodKey, answers } = reviewUpsertSchema.parse(await request.json());
    return prisma.review.upsert({
      where: { userId_period_periodKey: { userId, period, periodKey } },
      create: { userId, period, periodKey, answers },
      update: { answers },
    });
  });
}
