import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { projectUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: projectUpdateSchema,
  update: (id, userId, data) => prisma.project.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.project.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
