import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { journalUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: journalUpdateSchema,
  update: (id, userId, data) => prisma.journalEntry.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.journalEntry.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
