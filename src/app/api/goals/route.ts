import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { goalCreateSchema } from "@/lib/schemas";

const include = {
  projects: {
    include: {
      milestones: { orderBy: { order: "asc" } },
      tasks: { select: { id: true, status: true } },
    },
  },
} as const;

const routes = collectionRoutes({
  schema: goalCreateSchema,
  list: (userId) =>
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include }),
  create: (userId, data) => prisma.goal.create({ data: { ...data, userId }, include }),
});

export const GET = routes.GET;
export const POST = routes.POST;
