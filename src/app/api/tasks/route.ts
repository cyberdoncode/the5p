import { prisma } from "@/lib/prisma";
import { collectionRoutes } from "@/lib/crud";
import { taskCreateSchema } from "@/lib/schemas";

const include = { project: { select: { id: true, name: true, color: true } } };

const routes = collectionRoutes({
  schema: taskCreateSchema,
  list: (userId, params) => {
    const status = params.get("status");
    const projectId = params.get("projectId");
    return prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(projectId ? { projectId } : {}),
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include,
    });
  },
  create: (userId, data) => prisma.task.create({ data: { ...data, userId }, include }),
});

export const GET = routes.GET;
export const POST = routes.POST;
