import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import {
  subDays,
  startOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import { PAGINATION } from "@/config/constants";

function fillTimeSeriesGaps(
  rawClicks: { bucket: Date; _count: number }[],
  start: Date,
  end: Date,
) {
  const dataMap = new Map(
    rawClicks.map((rc) => [format(rc.bucket, "yyyy-MM-dd"), rc._count]),
  );

  const allDays = eachDayOfInterval({
    start: startOfDay(start),
    end: startOfDay(end),
  });

  return allDays.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return {
      bucket: day,
      _count: dataMap.get(key) ?? 0,
    };
  });
}

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
      const now = new Date();

      const url = await prisma.url.findFirst({
        where: { id: urlId, userId: ctx.auth.user.id },
      });

      if (!url) throw new TRPCError({ code: "NOT_FOUND" });

      let dateLimit = subDays(now, 7);
      if (range === "30d") dateLimit = subDays(now, 30);
      if (range === "90d") dateLimit = subDays(now, 90);
      if (range === "all") dateLimit = url.createdAt;

      const [rawClicks, devices, countries, browsers, os] = await Promise.all([
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
        clicksOverTime: fillTimeSeriesGaps(rawClicks, dateLimit, now),
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
        select: {
          id: true,
          timestamp: true,
          browser: true,
          os: true,
          device: true,
          country: true,
          city: true,
        },
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

      if (range === "all") {
        const firstUrl = await prisma.url.findFirst({
          where: { userId: ctx.auth.user.id },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });
        dateLimit = firstUrl?.createdAt ?? subDays(now, 30);
      }

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

      return fillTimeSeriesGaps(rawClicks, dateLimit, now);
    }),
});
