import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { projectCreateSchema } from "@/lib/schemas";

const include = {
  milestones: { orderBy: { order: "asc" } },
  goal: { select: { id: true, title: true } },
  tasks: { select: { id: true, status: true } },
} as const;

const routes = collectionRoutes({
  schema: projectCreateSchema,
  list: (userId) =>
    prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include }),
  create: (userId, data) => prisma.project.create({ data: { ...data, userId }, include }),
});

export const GET = routes.GET;
export const POST = routes.POST;
