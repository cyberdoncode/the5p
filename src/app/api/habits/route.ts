import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { habitCreateSchema } from "@/lib/schemas";

const include = { logs: { orderBy: { date: "desc" }, take: 120 } } as const;

const routes = collectionRoutes({
  schema: habitCreateSchema,
  list: (userId, params) =>
    prisma.habit.findMany({
      where: { userId, ...(params.get("includeArchived") === "1" ? {} : { archived: false }) },
      orderBy: { createdAt: "asc" },
      include,
    }),
  create: (userId, data) => prisma.habit.create({ data: { ...data, userId }, include }),
});

export const GET = routes.GET;
export const POST = routes.POST;
