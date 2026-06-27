import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { subDays } from "date-fns";
import { PAGINATION } from "@/config/constants";
import { startOfDay, eachDayOfInterval, format, isSameDay } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const where = { userId: ctx.auth.user.id };

      const [items, totalCount] = await Promise.all([
        prisma.url.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { totalClicks: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            originalUrl: true,
            totalClicks: true,
            createdAt: true,
          },
        }),
        prisma.url.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }),
  getOne: protectedProcedure
    .input(z.object({ urlId: z.string() }))
    .query(async ({ ctx, input }) => {
      const url = await prisma.url.findFirst({
        where: { id: input.urlId, userId: ctx.auth.user.id },
      });

      if (!url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found or access denied.",
        });
      }

      return url;
    }),
  getStats: protectedProcedure
    .input(
      z.object({
        urlId: z.string(),
        range: z.enum(["7d", "30d", "90d", "all"]).default("7d"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { urlId, range } = input;

      const url = await prisma.url.findFirst({
        where: { id: urlId, userId: ctx.auth.user.id },
      });

      if (!url) throw new TRPCError({ code: "NOT_FOUND" });

      let dateLimit = subDays(new Date(), 7);
      if (range === "30d") dateLimit = subDays(new Date(), 30);
      if (range === "90d") dateLimit = subDays(new Date(), 90);
      if (range === "all") dateLimit = new Date(0);

      const [clicksOverTime, devices, countries, browsers, os] =
        await Promise.all([
          prisma.$queryRaw<{ bucket: Date; _count: number }[]>`
            SELECT 
              date_trunc('day', "timestamp") as bucket, 
              count(*)::int as "_count"
            FROM "click"
            WHERE "urlId" = ${urlId} AND "timestamp" >= ${dateLimit}
            GROUP BY bucket
            ORDER BY bucket ASC
          `,

          prisma.click.groupBy({
            by: ["device"],
            where: { urlId, timestamp: { gte: dateLimit } },
            _count: true,
          }),

          prisma.click.groupBy({
            by: ["country"],
            where: { urlId, timestamp: { gte: dateLimit } },
            _count: true,
            orderBy: { _count: { country: "desc" } },
            take: 10,
          }),

          prisma.click.groupBy({
            by: ["browser"],
            where: { urlId, timestamp: { gte: dateLimit } },
            _count: true,
          }),

          prisma.click.groupBy({
            by: ["os"],
            where: { urlId, timestamp: { gte: dateLimit } },
            _count: true,
          }),
        ]);

      return {
        totalClicks: url.totalClicks,
        clicksOverTime,
        devices,
        countries,
        browsers,
        os,
      };
    }),

  getRecentClicks: protectedProcedure
    .input(z.object({ urlId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.click.findMany({
        where: {
          urlId: input.urlId,
          url: { userId: ctx.auth.user.id },
        },
        orderBy: { timestamp: "desc" },
        take: 50,
      });
    }),

  getDashboardStats: protectedProcedure
    .input(
      z.object({ range: z.enum(["7d", "30d", "90d", "all"]).default("7d") }),
    )

    .query(async ({ ctx, input }) => {
      const { range } = input;
      const now = new Date();

      let dateLimit = subDays(now, 7);
      if (range === "30d") dateLimit = subDays(now, 30);
      if (range === "90d") dateLimit = subDays(now, 90);
      if (range === "all") dateLimit = new Date(0);

      const rawClicks = await prisma.$queryRaw<
        { bucket: Date; _count: number }[]
      >`
    SELECT 
      date_trunc('day', c."timestamp") as bucket, 
      count(*)::int as "_count"
    FROM "click" c
    INNER JOIN "url" u ON c."urlId" = u.id
    WHERE u."userId" = ${ctx.auth.user.id} AND c."timestamp" >= ${dateLimit}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;

      const allDays = eachDayOfInterval({
        start: startOfDay(dateLimit),
        end: startOfDay(now),
      });

      const clicks = allDays.map((day) => {
        const found = rawClicks.find((rc) =>
          isSameDay(new Date(rc.bucket), day),
        );
        return {
          bucket: day,
          _count: found ? found._count : 0,
        };
      });

      return clicks;
    }),
});
