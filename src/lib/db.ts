import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { envSchem } from "@/config/env";

const globalPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: envSchem.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") globalPrisma.prisma = prisma

export default prisma;
