import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

if (globalThis.prisma) {
  globalThis.prisma
    .$disconnect()
    .catch((err) => console.error("Error closing Prisma Client:", err));
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
