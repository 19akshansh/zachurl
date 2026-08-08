import { auth } from "@/lib/auth";
import { getSubscriptionStatus } from "@/lib/subscriptions";
import { createUrlForUser } from "@/features/management/urls/server/service";
import { destinationUrlSchema } from "@/features/management/urls/server/validator";
import { TRPCError } from "@trpc/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  originalUrl: destinationUrlSchema,
  name: z.string().optional(),
  customSlug: z.string().min(3).max(30).optional().or(z.literal("")),
});

async function apiUser(request: NextRequest) {
  const key = request.headers.get("x-api-key");
  if (!key) return null;
  const result = await auth.api.verifyApiKey({ body: { key } });
  if (!result.valid || !result.key) return null;
  return result.key.referenceId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await apiUser(request);
    if (!userId) return NextResponse.json({ error: "UNAUTHORIZED", message: "Invalid or missing API key." }, { status: 401 });

    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "BAD_REQUEST", issues: parsed.error.issues }, { status: 400 });

    const status = await getSubscriptionStatus(userId);
    if (status === "UNKNOWN") return NextResponse.json({ error: "SERVICE_UNAVAILABLE", message: "Unable to verify subscription status." }, { status: 503 });

    const url = await createUrlForUser({ userId, limit: status === "PRO" ? Infinity : 1, input: parsed.data });
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof TRPCError) {
      const status = error.code === "FORBIDDEN" ? 403 : error.code === "CONFLICT" ? 409 : 500;
      return NextResponse.json({ error: error.code, message: error.message }, { status });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR", message: "Failed to create URL." }, { status: 500 });
  }
}
