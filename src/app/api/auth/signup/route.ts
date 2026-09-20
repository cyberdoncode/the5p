import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { handle } from "@/lib/http";
import { signupSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  return handle(async () => {
    const { name, email, password } = signupSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("An account with that email already exists");
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
      select: { id: true, name: true, email: true },
    });
    await createSession(user.id);
    return user;
  });
}
