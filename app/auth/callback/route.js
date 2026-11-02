
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const redirectTo = (path) =>
    NextResponse.redirect(new URL(path, requestUrl.origin));

  try {
    const supabase = await createClient();

    // Verify email using Supabase token hash
    if (tokenHash) {
      const allowedTypes = ["signup", "email"];

      if (!allowedTypes.includes(type)) {
        return redirectTo("/login?error=invalid-link");
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        console.error("Email verification failed:", error.message);
        return redirectTo("/login?error=expired-link");
      }
    }

    // Verify email using PKCE code
    else if (code) {
      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Code exchange failed:", error.message);
        return redirectTo("/login?error=expired-link");
      }
    } else {
      return redirectTo("/login?error=invalid-link");
    }

    // Get the verified user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirectTo("/login?error=verification-failed");
    }

    // Find the user's account role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup failed:", profileError.message);
    }

    const role = profile?.role || user.user_metadata?.role;

    let destination;

    if (role === "customer") {
      destination = "/customer";
    } else if (role === "creator") {
      destination = "/dashboard";
    } else {
      return redirectTo("/login?error=role-not-found");
    }

    const successUrl = new URL(destination, requestUrl.origin);
    successUrl.searchParams.set("verified", "1");

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Authentication callback error:", error);
    return redirectTo("/login?error=service-unavailable");
  }
}
