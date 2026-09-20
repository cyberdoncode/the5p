import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handle } from "@/lib/http";
import { milestoneCreateSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const data = milestoneCreateSchema.parse(await request.json());
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
      select: { id: true },
    });
    if (!project) throw new Error("Project not found");
    return prisma.milestone.create({ data });
  });
}
