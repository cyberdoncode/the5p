import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { goalUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: goalUpdateSchema,
  update: (id, userId, data) => prisma.goal.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.goal.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
