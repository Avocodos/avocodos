import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "info", "warn", "error"],
    errorFormat: "pretty",
    transactionOptions: {
      maxWait: 30000,
      timeout: 30000,
    },
  });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma =
  global.prisma ??
  (typeof window === 'undefined' ? prismaClientSingleton() : undefined);

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
