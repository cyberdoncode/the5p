import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { handle } from "@/lib/http";
import { signupSchema } from "@/lib/schemas";

/**
 * Optional signup allowlist.
 *
 * Set SIGNUP_ALLOWLIST to a comma-separated list of email addresses to restrict
 * who can create an account, e.g. "me@example.com, client@example.com".
 * Leave it unset (or empty) and signup stays open to anyone.
 */
function isAllowedToSignUp(email: string) {
  const allowed = (process.env.SIGNUP_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) return true;
  return allowed.includes(email.trim().toLowerCase());
}

export async function POST(request: NextRequest) {
  return handle(async () => {
    const { name, email, password } = signupSchema.parse(await request.json());
    if (!isAllowedToSignUp(email)) {
      throw new Error("This email address isn't approved for signup.");
    }
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
