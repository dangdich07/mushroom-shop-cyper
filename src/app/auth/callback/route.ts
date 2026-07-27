import { NextResponse, type NextRequest } from "next/server";
import { getSafeInternalRedirect } from "@/features/auth/safeRedirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeInternalRedirect(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=AUTH_CALLBACK_FAILED", request.url));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=AUTH_CALLBACK_FAILED", request.url));
  return NextResponse.redirect(new URL(next, request.url));
}
