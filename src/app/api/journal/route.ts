import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { journalCreateSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const params = request.nextUrl.searchParams;
    const type = params.get("type");
    const date = params.get("date");
    return prisma.journalEntry.findMany({
      where: { userId, ...(type ? { type } : {}), ...(date ? { date } : {}) },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 200,
    });
  });
}

export async function POST(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const data = journalCreateSchema.parse(await request.json());
    return prisma.journalEntry.create({ data: { ...data, userId } });
  });
}
