import { auth } from "@/lib/auth";
import { getSubscriptionStatus } from "@/lib/subscriptions";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  let session = await auth.api.getSession({
    headers: opts.headers,
  });

  if (!session) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    session = await auth.api.getSession({
      headers: opts.headers,
    });
  }

  return {
    session,
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
  });

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const unprotectecdProcedure = baseProcedure.use(async ({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      auth: null,
    },
  });
});

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = ctx.session;

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You can't access this.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});

export const proProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const subscriptionStatus = await getSubscriptionStatus(ctx.auth.user.id);

  if (subscriptionStatus === "UNKNOWN") {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Unable to verify subscription status. Please try again shortly.",
    });
  }

  const hasPro = subscriptionStatus === "PRO";

  return next({
    ctx: {
      ...ctx,
      limits: hasPro
        ? {
            urls: Infinity,
            qrCodes: Infinity,
          }
        : {
            urls: 1,
            qrCodes: 2,
          },
      hasPro,
    },
  });
});
