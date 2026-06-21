import { generateSlug } from "random-word-slugs";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  proProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { TRPCError } from "@trpc/server";
import { destinationUrlSchema, isAllowedDestinationUrl } from "./validator";

const generateRandomSlug = () => {
  const words = generateSlug(2);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${words}-${randomStr}`;
};

export const urlsRouter = createTRPCRouter({
  create: proProcedure
    .input(
      z.object({
        originalUrl: destinationUrlSchema,
        name: z.string().optional(),
        customSlug: z.string().min(3).max(30).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { originalUrl, name, customSlug } = input;

      const urlCount = await prisma.url.count({
        where: { userId: ctx.auth.user.id },
      });

      if (urlCount >= ctx.limits.urls) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "URL limit reached. UPGRADE TO PRO.",
        });
      }

      const isCustom = customSlug && customSlug.trim().length > 0;
      const finalSlug = isCustom ? customSlug!.trim() : generateRandomSlug();

      if (isCustom) {
        const existing = await prisma.url.findUnique({
          where: { slug: finalSlug },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "This custom slug is already in use. Please try another one.",
          });
        }
      }

      try {
        return await prisma.url.create({
          data: {
            name: name || generateSlug(2),
            originalUrl,
            slug: finalSlug,
            userId: ctx.auth.user.id,
            qrCode: {
              create: {
                fgColor: "#000000",
                bgColor: "#FFFFFF",
              },
            },
          },
        });
  } catch (error) {
        console.error("[CREATE_URL_ERROR]", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create URL. Please try again later.",
        });
      }
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where = {
        userId: ctx.auth.user.id,
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { originalUrl: { contains: search, mode: "insensitive" as const } },
        ],
      };

      const [items, totalCount] = await Promise.all([
        prisma.url.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          orderBy: { createdAt: "desc" },
          include: {
            qrCode: true,
            _count: {
              select: { clicks: true },
            },
          },
        }),
        prisma.url.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      };
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const url = await prisma.url.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          qrCode: true,
          clicks: {
            take: 10,
            orderBy: {
              timestamp: "desc",
            },
          },
        },
      });

      if (!url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found",
        });
      }

      return url;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        originalUrl: destinationUrlSchema,
        qrCode: z
          .object({
            fgColor: z.string().optional(),
            bgColor: z.string().optional(),
            logoUrl: z.string().url().nullish(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, qrCode, ...urlData } = input;

      const existing = await prisma.url.findFirst({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found",
        });
      }

      return prisma.url.update({
        where: {
          id,
        },
        data: {
          ...urlData,
          qrCode: qrCode
            ? {
                update: qrCode,
              }
            : undefined,
        },
        include: {
          qrCode: true,
        },
      });
    }),
  getAnalytics: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const url = await prisma.url.findFirstOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      const [clicksByDevice, clicksByCountry, clicksByBrowser] =
        await Promise.all([
          prisma.click.groupBy({
            by: ["device"],
            where: { urlId: input.id },
            _count: true,
          }),
          prisma.click.groupBy({
            by: ["country"],
            where: { urlId: input.id },
            _count: true,
          }),
          prisma.click.groupBy({
            by: ["browser"],
            where: { urlId: input.id },
            _count: true,
          }),
        ]);

      return {
        totalClicks: url.totalClicks,
        devices: clicksByDevice,
        countries: clicksByCountry,
        browsers: clicksByBrowser,
      };
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const url = await prisma.url.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found",
        });
      }

      await prisma.url.delete({
        where: {
          id: url.id,
        },
      });

      return url;
    }),
  resolveAndTrack: unprotectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { slug } = input;

      const url = await prisma.url.findUnique({
        where: { slug },
      });

      if (!url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found",
        });
      }

      await prisma.$transaction([
        prisma.url.update({
          where: { id: url.id },
          data: { totalClicks: { increment: 1 } },
        }),
        prisma.click.create({
          data: {
            urlId: url.id,
            device: "Unknown",
            browser: "Unknown",
            country: "Unknown",
          },
        }),
      ]);

      if (!isAllowedDestinationUrl(url.originalUrl)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid destination URL",
        });
      }

      return { originalUrl: url.originalUrl };
    }),
});
