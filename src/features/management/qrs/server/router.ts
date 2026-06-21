import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/config/constants";

export const qrsRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({ urlId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { urlId } = input;

      const url = await prisma.url.findFirst({
        where: { id: urlId, userId: ctx.auth.user.id },
      });

      if (!url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found.",
        });
      }

      return prisma.qrCode.upsert({
        where: { urlId },
        update: {}, 
        create: {
          urlId,
          fgColor: "#000000",
          bgColor: "#FFFFFF",
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ urlId: z.string() }))
    .query(async ({ ctx, input }) => {
      const qrCode = await prisma.qrCode.findFirst({
        where: {
          urlId: input.urlId,
          url: {
            userId: ctx.auth.user.id,
          },
        },
        include: {
          url: true,
        },
      });

      if (!qrCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "QR Code not found for this URL.",
        });
      }

      return qrCode;
    }),
  update: protectedProcedure
    .input(
      z.object({
        urlId: z.string(),
        fgColor: z.string().optional(),
        bgColor: z.string().optional(),
        logoUrl: z.string().url().nullish().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { urlId, ...data } = input;

      const existingUrl = await prisma.url.findFirst({
        where: { id: urlId, userId: ctx.auth.user.id },
      });

      if (!existingUrl) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "URL not found or access denied.",
        });
      }

      return prisma.qrCode.upsert({
        where: { urlId },
        update: {
          fgColor: data.fgColor,
          bgColor: data.bgColor,
          logoUrl: data.logoUrl === "" ? null : data.logoUrl,
        },
        create: {
          urlId,
          fgColor: data.fgColor ?? "#000000",
          bgColor: data.bgColor ?? "#FFFFFF",
          logoUrl: data.logoUrl === "" ? null : data.logoUrl,
        },
      });
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const where = {
        userId: ctx.auth.user.id,
      };

      const [items, totalCount] = await Promise.all([
        prisma.qrCode.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            url: where,
          },
          include: {
            url: {
              select: {
                name: true,
                slug: true,
                originalUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.qrCode.count({
          where: { url: where },
        }),
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
  resetStyles: protectedProcedure
    .input(z.object({ urlId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { urlId } = input;

      const existingUrl = await prisma.url.findFirst({
        where: { id: urlId, userId: ctx.auth.user.id },
      });

      if (!existingUrl) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "URL not found or access denied.",
        });
      }

      return prisma.qrCode.upsert({
        where: { urlId },
        update: {
          fgColor: "#000000",
          bgColor: "#FFFFFF",
          logoUrl: null,
        },
        create: {
          urlId,
          fgColor: "#000000",
          bgColor: "#FFFFFF",
          logoUrl: null,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ urlId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { urlId } = input;

      const qrCode = await prisma.qrCode.findFirst({
        where: {
          urlId,
          url: {
            userId: ctx.auth.user.id,
          },
        },
      });

      if (!qrCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "QR Code not found or you don't have permission to delete it.",
        });
      }

      return prisma.qrCode.delete({
        where: { urlId },
      });
    }),
});
