import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { settingsSchema } from "@/lib/schemas";

export async function GET() {
  return handle(async () => ({ user: await getCurrentUser() }));
}

export async function PATCH(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const data = settingsSchema.parse(await request.json());
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, timezone: true, weekStart: true, currency: true, accent: true },
    });
  });
}
