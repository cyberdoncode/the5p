import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { milestoneUpdateSchema } from "@/lib/schemas";

async function ownedMilestone(id: string, userId: string) {
  const milestone = await prisma.milestone.findFirst({
    where: { id, project: { userId } },
    select: { id: true },
  });
  if (!milestone) throw new Error("Not found");
  return milestone;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await context.params;
    await ownedMilestone(id, userId);
    const data = milestoneUpdateSchema.parse(await request.json());
    return prisma.milestone.update({ where: { id }, data });
  });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await context.params;
    await ownedMilestone(id, userId);
    await prisma.milestone.delete({ where: { id } });
    return { id, deleted: true };
  });
}
