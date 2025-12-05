import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "mba@example.com" },
    update: {},
    create: {
      email: "mba@example.com",
      name: "mbauser",
    },
  });

  console.log("user created:", user);

  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        title: "workout",
        description: "do 100 push ups each day",
        userId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        title: "read",
        description: "read 30 pages of a book",
        userId: user.id,
      },
    }),
  ]);

  console.log("habits created:", habits);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const completions = await Promise.all([
    prisma.completion.create({
      data: {
        habitId: habits[1].id,
        date: yesterday,
      },
    }),
  ]);

  console.log("completions created:", completions);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
