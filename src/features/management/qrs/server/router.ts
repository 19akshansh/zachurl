import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { PAGINATION } from "@/config/constants";

export const qrsRouter = createTRPCRouter({
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
        fgColor: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex Color")
          .optional(),
        bgColor: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex Color")
          .optional(),
        logoUrl: z.url().nullish().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { urlId, ...data } = input;

      const existingUrl = await prisma.url.findFirst({
        where: {
          id: urlId,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingUrl) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to modify this QR code.",
        });
      }

      return prisma.qrCode.update({
        where: { urlId },
        data: {
          fgColor: data.fgColor,
          bgColor: data.bgColor,
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
      const existingUrl = await prisma.url.findFirst({
        where: {
          id: input.urlId,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingUrl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "URL not found.",
        });
      }

      return prisma.qrCode.update({
        where: { urlId: input.urlId },
        data: {
          fgColor: "#000000",
          bgColor: "#FFFFFF",
          logoUrl: null,
        },
      });
    }),
});
