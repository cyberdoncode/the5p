import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { expenseCreateSchema } from "@/lib/schemas";

const routes = collectionRoutes({
  schema: expenseCreateSchema,
  list: (userId, params) => {
    const month = params.get("month");
    return prisma.expense.findMany({
      where: { userId, ...(month ? { date: { startsWith: month } } : {}) },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },
  create: (userId, data) => prisma.expense.create({ data: { ...data, userId } }),
});

export const GET = routes.GET;
export const POST = routes.POST;
