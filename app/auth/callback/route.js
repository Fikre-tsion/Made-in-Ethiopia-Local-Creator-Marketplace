import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  // Prevent unsafe redirects
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
      ? next
      : "/dashboard";

  const redirectTo = (path) =>
    NextResponse.redirect(new URL(path, requestUrl.origin));

  try {
    const supabase = await createClient();

    // Method 1: Email confirmation using token_hash
    if (token_hash && type === "email") {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "email",
      });

      if (error) {
        console.error("Email verification failed:", error.message);
        return redirectTo("/login?error=expired-link");
      }
    }

    // Method 2: Email confirmation using PKCE code
    else if (code) {
      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Code exchange failed:", error.message);
        return redirectTo("/login?error=expired-link");
      }
    }

    // No valid confirmation information
    else {
      return redirectTo("/login?error=invalid-link");
    }

    // Email verified successfully
    return redirectTo(safeNext);
  } catch (error) {
    console.error("Authentication callback error:", error);

    return redirectTo("/login?error=service-unavailable");
  }
}