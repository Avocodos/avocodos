import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate())
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma =
  global.prisma ??
  (typeof window === 'undefined' ? prismaClientSingleton() : undefined);

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
