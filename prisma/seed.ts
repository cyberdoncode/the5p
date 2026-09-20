import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, format, setHours, startOfDay, subDays } from "date-fns";

const prisma = new PrismaClient();
const day = (date: Date) => format(date, "yyyy-MM-dd");

async function main() {
  const email = "don@the5p.app";
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Don",
      passwordHash: await bcrypt.hash("prepare2026", 10),
      currency: "USD",
    },
  });
  const userId = user.id;
  const today = new Date();

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: "Build a profitable software career",
      why: "Freedom to work on my own terms, from anywhere, on things I actually respect.",
      horizon: "year",
      targetDate: addDays(today, 240),
    },
  });

  const project = await prisma.project.create({
    data: {
      userId,
      goalId: goal.id,
      name: "Build THE5P",
      description: "A premium personal operating system — my flagship portfolio product.",
      dueDate: addDays(today, 60),
    },
  });

  const milestoneTitles = ["Design", "Frontend", "Backend", "Authentication", "Database", "Deployment"];
  const milestones = await Promise.all(
    milestoneTitles.map((title, order) =>
      prisma.milestone.create({
        data: { projectId: project.id, title, order, done: order < 2 },
      }),
    ),
  );

  await prisma.task.createMany({
    data: [
      { userId, title: "Build website", projectId: project.id, milestoneId: milestones[1].id, priority: "high", dueDate: today },
      { userId, title: "Complete Python lesson", priority: "medium", dueDate: today },
      { userId, title: "Football", priority: "low", dueDate: today },
      { userId, title: "Handle finances", priority: "high", dueDate: today },
      { userId, title: "Journal", priority: "medium", dueDate: today },
      { userId, title: "Wire authentication flow", projectId: project.id, milestoneId: milestones[3].id, priority: "critical", dueDate: addDays(today, 3) },
      { userId, title: "Design database schema", projectId: project.id, milestoneId: milestones[4].id, status: "done", completedAt: subDays(today, 1) },
      { userId, title: "Deploy first version", projectId: project.id, milestoneId: milestones[5].id, dueDate: addDays(today, 12) },
    ],
  });

  await prisma.dailyPriority.createMany({
    data: ["Build website", "Complete Python lesson", "Football", "Handle finances", "Journal"].map(
      (text, index) => ({ userId, date: day(today), slot: index + 1, text, done: index === 0 }),
    ),
  });

  await prisma.calendarEvent.createMany({
    data: [
      { userId, title: "Deep work — THE5P frontend", start: setHours(startOfDay(today), 9), end: setHours(startOfDay(today), 12), category: "focus" },
      { userId, title: "Python lesson", start: setHours(startOfDay(today), 14), end: setHours(startOfDay(today), 15), category: "personal" },
      { userId, title: "Football", start: setHours(startOfDay(today), 18), end: setHours(startOfDay(today), 20), category: "health" },
    ],
  });

  const habitSeeds = [
    { name: "Code", cue: "Right after breakfast", targetPerWeek: 6 },
    { name: "Read 20 pages", cue: "Before bed", targetPerWeek: 5 },
    { name: "Train", cue: "Evening", targetPerWeek: 4 },
    { name: "Journal", cue: "Night review", targetPerWeek: 7 },
    { name: "Water 3L", targetPerWeek: 7 },
  ];

  for (const seed of habitSeeds) {
    const habit = await prisma.habit.create({ data: { userId, ...seed } });
    const logs = [];
    for (let i = 0; i < 40; i += 1) {
      if (Math.random() < 0.68) {
        logs.push({ habitId: habit.id, userId, date: day(subDays(today, i)), done: true });
      }
    }
    await prisma.habitLog.createMany({ data: logs });
  }

  await prisma.journalEntry.create({
    data: {
      userId,
      type: "daily",
      date: day(subDays(today, 1)),
      title: "Momentum",
      body: "Shipped the schema. Slower than I wanted but it is real now.",
      answers: JSON.stringify({
        "What did I accomplish?": "Database schema and the first API routes.",
        "What went wrong?": "Lost two hours to tutorials I didn't need.",
        "What did I learn?": "Build first, read second.",
      }),
    },
  });

  await prisma.expense.createMany({
    data: [
      { userId, kind: "income", label: "Freelance invoice", amount: 1800, category: "general", date: day(subDays(today, 6)) },
      { userId, kind: "expense", label: "Rent", amount: 700, category: "housing", date: day(subDays(today, 10)), recurring: true },
      { userId, kind: "expense", label: "Groceries", amount: 180, category: "food", date: day(subDays(today, 4)) },
      { userId, kind: "expense", label: "Domain + hosting", amount: 42, category: "tools", date: day(subDays(today, 3)), recurring: true },
      { userId, kind: "expense", label: "Gym", amount: 35, category: "health", date: day(subDays(today, 8)), recurring: true },
      { userId, kind: "saving", label: "Emergency fund", amount: 300, category: "general", date: day(subDays(today, 2)) },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { userId, category: "housing", monthly: 750 },
      { userId, category: "food", monthly: 300 },
      { userId, category: "tools", monthly: 80 },
    ],
  });

  await prisma.note.createMany({
    data: [
      { userId, title: "THE5P positioning", kind: "idea", tags: "product,brand", pinned: true, body: "Apple × Notion × Linear. Quiet, expensive, deliberate. Never a colourful student planner." },
      { userId, title: "Atomic Habits", kind: "book", tags: "habits", body: "Systems over goals. Make it obvious, attractive, easy, satisfying." },
      { userId, title: "Deployment checklist", kind: "resource", tags: "devops", body: "Env vars, migrations, backups, error tracking, uptime check." },
    ],
  });

  console.log(`Seeded ${email} / prepare2026`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
