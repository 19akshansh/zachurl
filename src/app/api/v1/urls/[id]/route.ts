import { auth } from "@/lib/auth";
import { getUrlForUser } from "@/features/management/urls/server/service";
import { TRPCError } from "@trpc/server";
import { NextRequest, NextResponse } from "next/server";

async function apiUser(request: NextRequest) {
  const key = request.headers.get("x-api-key");
  if (!key) return null;
  const result = await auth.api.verifyApiKey({ body: { key } });
  if (!result.valid || !result.key) return null;
  return result.key.referenceId;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await apiUser(request);
    if (!userId) return NextResponse.json({ error: "UNAUTHORIZED", message: "Invalid or missing API key." }, { status: 401 });
    const { id } = await params;
    const url = await getUrlForUser(userId, id);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return NextResponse.json({ error: "NOT_FOUND", message: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR", message: "Failed to fetch URL." }, { status: 500 });
  }
}
