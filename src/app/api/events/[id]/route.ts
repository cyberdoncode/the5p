import { prisma } from "@/lib/prisma";
import { itemRoutes } from "@/lib/crud";
import { eventUpdateSchema } from "@/lib/schemas";

const routes = itemRoutes({
  schema: eventUpdateSchema,
  update: (id, userId, data) => prisma.calendarEvent.updateMany({ where: { id, userId }, data }),
  remove: (id, userId) => prisma.calendarEvent.deleteMany({ where: { id, userId } }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
