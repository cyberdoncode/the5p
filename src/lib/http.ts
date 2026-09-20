import { ZodError } from "zod";
import { UnauthorizedError } from "./auth";

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export async function handle<T>(fn: () => Promise<T>) {
  try {
    return Response.json(await fn());
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid input", issues: error.issues },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 400 });
  }
}
