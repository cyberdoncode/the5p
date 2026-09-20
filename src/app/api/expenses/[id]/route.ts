import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { expenseUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: expenseUpdateSchema,
  update: (id, userId, data) => prisma.expense.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.expense.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
