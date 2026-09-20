import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { habitUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: habitUpdateSchema,
  update: (id, userId, data) => prisma.habit.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.habit.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
