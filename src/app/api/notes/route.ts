import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { noteCreateSchema } from "@/lib/schemas";

const routes = collectionRoutes({
  schema: noteCreateSchema,
  list: (userId, params) => {
    const kind = params.get("kind");
    const query = params.get("q");
    return prisma.note.findMany({
      where: {
        userId,
        ...(kind ? { kind } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { body: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
  },
  create: (userId, data) => prisma.note.create({ data: { ...data, userId } }),
});

export const GET = routes.GET;
export const POST = routes.POST;
