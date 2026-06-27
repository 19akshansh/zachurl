import { urlsRouter } from "@/features/management/urls/server/router";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { qrsRouter } from "@/features/management/qrs/server/router";
import { analyticsRouter } from "@/features/insights/analytics/server/router";

export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findMany();
  }),
  urls: urlsRouter,
  qrs: qrsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
