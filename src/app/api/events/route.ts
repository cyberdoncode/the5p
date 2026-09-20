import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { eventCreateSchema } from "@/lib/schemas";

const routes = collectionRoutes({
  schema: eventCreateSchema,
  list: (userId, params) => {
    const from = params.get("from");
    const to = params.get("to");
    return prisma.calendarEvent.findMany({
      where: {
        userId,
        ...(from && to ? { start: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      orderBy: { start: "asc" },
    });
  },
  create: (userId, data) => prisma.calendarEvent.create({ data: { ...data, userId } }),
});

export const GET = routes.GET;
export const POST = routes.POST;
