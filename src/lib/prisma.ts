import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern: without this, hot-reload in dev
// creates a new PrismaClient (and a new DB connection pool) on every
// file save, until the database refuses new connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
