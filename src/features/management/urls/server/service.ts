import { generateSlug } from "random-word-slugs";
import prisma from "@/lib/db";
import { TRPCError } from "@trpc/server";

const generateRandomSlug = () => {
  const words = generateSlug(2);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${words}-${randomStr}`;
};

type CreateUrlInput = {
  originalUrl: string;
  name?: string;
  customSlug?: string;
};

export async function createUrlForUser({
  userId,
  limit,
  input,
}: {
  userId: string;
  limit: number;
  input: CreateUrlInput;
}) {
  const urlCount = await prisma.url.count({ where: { userId } });

  if (urlCount >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "URL limit reached. UPGRADE TO PRO.",
    });
  }

  const isCustom = Boolean(input.customSlug?.trim());
  const finalSlug = isCustom ? input.customSlug!.trim() : generateRandomSlug();

  if (isCustom) {
    const existing = await prisma.url.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This custom slug is already in use. Please try another one.",
      });
    }
  }

  try {
    return await prisma.url.create({
      data: {
        name: input.name || generateSlug(2),
        originalUrl: input.originalUrl,
        slug: finalSlug,
        userId,
        qrCode: { create: { fgColor: "#000000", bgColor: "#FFFFFF" } },
      },
    });
  } catch (error) {
    console.error("[CREATE_URL_ERROR]", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create URL. Please try again later.",
    });
  }
}

export async function getUrlForUser(userId: string, id: string) {
  const url = await prisma.url.findFirst({
    where: { id, userId },
    include: {
      qrCode: true,
      clicks: { take: 10, orderBy: { timestamp: "desc" } },
    },
  });

  if (!url) {
    throw new TRPCError({ code: "NOT_FOUND", message: "URL not found" });
  }
  return url;
}
