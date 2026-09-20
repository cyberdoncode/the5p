# THE5P

**Proper Preparation Prevents Poor Performance.**

A personal operating system: Command Center, Planner, Calendar, Tasks, Goals → Projects → Milestones,
Habits, Journal, Finance, Notes and Reviews — in one premium dark interface.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4, Inter / Instrument Serif / JetBrains Mono
- Prisma + PostgreSQL
- Email + password auth with bcrypt and a signed JWT in an HTTP-only cookie

## Environment variables

| Variable       | What it is                                                              |
| -------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL` | **Pooled** Postgres connection. On Neon this host contains `-pooler`.    |
| `DIRECT_URL`   | **Direct** connection — the same string *without* `-pooler`.             |
| `AUTH_SECRET`  | Random string signing the session cookie. `openssl rand -base64 48`.     |

Two database URLs because the app runs on serverless functions. Runtime queries go through the
pooler so hundreds of cold starts don't exhaust Postgres connections; migrations need session
state and advisory locks that a transaction pooler can't provide, so they take the direct route.
Locally, point both at the same URL.

Changing `AUTH_SECRET` invalidates every session and signs all users out.

## Local development

```bash
cp .env.example .env          # fill in the three variables above
npm install
npx prisma migrate dev
npm run seed                  # optional demo account: don@the5p.app / prepare2026
npm run dev
```

A throwaway local database:

```bash
docker run -d --name the5p-pg -e POSTGRES_PASSWORD=devlocal -e POSTGRES_DB=the5p -p 55432:5432 postgres:16-alpine
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Neon, open your project → **Connect** and copy both connection strings (the pooled one, and
   the same string with `-pooler` removed from the host).
3. In Vercel: **Add New → Project → Import** the repository. Leave the framework preset as Next.js.
4. Before clicking Deploy, add the three environment variables above to **all** environments
   (Production, Preview, Development).
5. Deploy. `vercel.json` runs `prisma migrate deploy` ahead of the build, so the schema is applied
   automatically on every deploy.
6. Open the site and create your account at `/signup`.

The first account you create is just a normal user — there is no admin role. If you want the app to
be yours alone, sign up once and then leave it; or delete the `/signup` route and create users by
hand.

### Deploying to Netlify instead

`netlify.toml` is still in the repo and does the same job: **Add new site → Import from GitHub**,
set the same three environment variables, deploy. Having both files committed is harmless — each
platform ignores the other's config.

## Structure

```
src/app/(app)/        dashboard, planner, calendar, tasks, goals, habits,
                      journal, finance, notes, reviews, settings
src/app/api/          auth, me, dashboard and CRUD endpoints per module
src/lib/              auth, prisma, validation schemas, CRUD helpers, dates
prisma/schema.prisma  users, tasks, projects, goals, milestones, habits,
                      habit logs, journal entries, calendar events, expenses,
                      budgets, notes, reviews, daily priorities
```

Every API route resolves the signed-in user from the session cookie and scopes queries by `userId`,
so accounts can never read or write each other's data.
