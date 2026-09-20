import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { taskUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: taskUpdateSchema,
  update: (id, userId, data) => prisma.task.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.task.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
