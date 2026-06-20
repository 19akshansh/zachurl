import { urlsRouter } from "@/features/management/urls/server/router";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";

export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findMany();
  }),
  urls: urlsRouter,
});

export type AppRouter = typeof appRouter;
