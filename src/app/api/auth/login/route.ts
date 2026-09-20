import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { handle } from "@/lib/http";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  return handle(async () => {
    const { email, password } = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error("Incorrect email or password");
    }
    await createSession(user.id);
    return { id: user.id, name: user.name, email: user.email };
  });
}
