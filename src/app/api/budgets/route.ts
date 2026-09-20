import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { budgetUpsertSchema } from "@/lib/schemas";

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    return prisma.budget.findMany({ where: { userId }, orderBy: { category: "asc" } });
  });
}

export async function PUT(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { category, monthly } = budgetUpsertSchema.parse(await request.json());
    return prisma.budget.upsert({
      where: { userId_category: { userId, category } },
      create: { userId, category, monthly },
      update: { monthly },
    });
  });
}
