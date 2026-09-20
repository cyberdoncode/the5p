import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { noteUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: noteUpdateSchema,
  update: (id, userId, data) => prisma.note.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.note.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
