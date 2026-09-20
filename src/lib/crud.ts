import { z } from "zod";
import type { NextRequest } from "next/server";
import { requireUserId } from "./auth";
import { handle } from "./http";

export function collectionRoutes<TCreate>(options: {
  schema: z.ZodType<TCreate>;
  list: (userId: string, params: URLSearchParams) => Promise<unknown>;
  create: (userId: string, data: TCreate) => Promise<unknown>;
}) {
  return {
    GET: async (request: NextRequest) =>
      handle(async () => {
        const userId = await requireUserId();
        return options.list(userId, request.nextUrl.searchParams);
      }),
    POST: async (request: NextRequest) =>
      handle(async () => {
        const userId = await requireUserId();
        return options.create(userId, options.schema.parse(await request.json()));
      }),
  };
}

export function itemRoutes<TUpdate>(options: {
  schema: z.ZodType<TUpdate>;
  update: (id: string, userId: string, data: TUpdate) => Promise<{ count: number }>;
  remove: (id: string, userId: string) => Promise<{ count: number }>;
}) {
  return {
    PATCH: async (request: NextRequest, context: { params: Promise<{ id: string }> }) =>
      handle(async () => {
        const userId = await requireUserId();
        const { id } = await context.params;
        const data = options.schema.parse(await request.json());
        const result = await options.update(id, userId, data);
        if (result.count === 0) throw new Error("Not found");
        return { id, ...data };
      }),
    DELETE: async (_request: NextRequest, context: { params: Promise<{ id: string }> }) =>
      handle(async () => {
        const userId = await requireUserId();
        const { id } = await context.params;
        await options.remove(id, userId);
        return { id, deleted: true };
      }),
  };
}
