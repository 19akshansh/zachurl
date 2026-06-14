import "server-only"; // Ensures this code never runs on the client
import { headers } from "next/headers";
import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createCallerFactory, createTRPCContext } from "./init";
import { appRouter } from "@/trpc/routers/_app";

export const getQueryClient = cache(() => new QueryClient());

const getContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const createCaller = createCallerFactory(appRouter);
export const trpc = createCaller(getContext);
