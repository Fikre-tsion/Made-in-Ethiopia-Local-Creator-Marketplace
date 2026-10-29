"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { getAuthErrorMessage } from "../../lib/auth/validation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedRole =
    searchParams.get("role") === "creator"
      ? "creator"
      : searchParams.get("role") === "customer"
      ? "customer"
      : null;

  const nextPath = searchParams.get("next");
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const roleLabel =
    selectedRole === "creator"
      ? "Creator"
      : selectedRole === "customer"
      ? "Customer"
      : "";

  let initialMessage = "";

  if (authError === "expired-link") {
    initialMessage =
      "This confirmation or recovery link has expired. Request a new one.";
  } else if (authError === "invalid-link") {
    initialMessage =
      "This authentication link is invalid. Request a new one.";
  } else if (authError === "service-unavailable") {
    initialMessage =
      "Authentication is temporarily unavailable. Please try again.";
  } else if (authError === "profile-unavailable") {
    initialMessage =
      "Your account profile is unavailable. Please try again or contact support.";
  }

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || cooldown > 0) return;

    setLoading(true);
    setMessage("");
    setResetMessage("");

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        throw new Error(
          "Unable to retrieve your account information."
        );
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError || !profile) {
        setMessage(
          "Your account profile could not be found. Please contact support."
        );
        return;
      }

      const userRole = profile.role;

      if (
        userRole !== "creator" &&
        userRole !== "customer"
      ) {
        setMessage(
          "Your account role could not be verified. Please contact support."
        );
        return;
      }

      // Prevent signing into a different role than the one selected.
      if (selectedRole && selectedRole !== userRole) {
        setMessage(
          `This account is registered as a ${userRole}. Please return to the welcome page and choose ${userRole}.`
        );
        await supabase.auth.signOut();
        return;
      }

    // Both creators and customers enter the marketplace homepage.
    let destination = "/home";

      if (
        nextPath &&
        nextPath.startsWith("/") &&
        !nextPath.startsWith("//") &&
        !nextPath.startsWith("/\\")
      ) {
        const creatorRoute =
          nextPath === "/dashboard" ||
          nextPath.startsWith("/dashboard/");

        const customerRoute =
          nextPath === "/customer" ||
          nextPath.startsWith("/customer/");

        if (
          (userRole === "creator" && creatorRoute) ||
          (userRole === "customer" && customerRoute)
        ) {
          destination = nextPath;
        }
      }

      router.replace(destination);
      router.refresh();
    } catch (error) {
      if (
        error?.status === 429 ||
        error?.message?.toLowerCase().includes("rate limit") ||
        error?.message?.toLowerCase().includes("too many")
      ) {
        setCooldown(60);
      }

      setMessage(
        getAuthErrorMessage(
          error,
          "Unable to sign in. Check your email and password."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (loading || cooldown > 0) return;

    if (!email.trim()) {
      setResetMessage("Enter your email first.");
      return;
    }

    setLoading(true);
    setResetMessage("");

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo:
              `${window.location.origin}/auth/callback?next=/reset-password`,
          }
        );

      if (error) {
        setResetMessage(
          getAuthErrorMessage(
            error,
            "We could not send a reset email. Try again."
          )
        );
      } else {
        setResetMessage(
          "Check your email for a password reset link."
        );
      }
    } catch (error) {
      if (
        error?.status === 429 ||
        error?.message?.toLowerCase().includes("rate limit") ||
        error?.message?.toLowerCase().includes("too many")
      ) {
        setCooldown(60);
      }

      setResetMessage(
        getAuthErrorMessage(
          error,
          "We could not send a reset email. Try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-split">
        <div className="auth-visual">
          <Link href="/" className="auth-brand">
            <span className="brand-mark">M</span>
            Made in Ethiopia
          </Link>

          <div className="auth-visual-copy">
            <p className="eyebrow">WELCOME BACK</p>

            <h2>
              {selectedRole === "creator"
                ? "Your creativity deserves to be seen."
                : selectedRole === "customer"
                ? "Discover the beauty of Ethiopian creativity."
                : "Continue your Ethiopian story."}
            </h2>

            <p>
              {selectedRole === "creator"
                ? "Manage your shop, showcase your creations, and connect with customers."
                : selectedRole === "customer"
                ? "Explore authentic handmade products and support talented Ethiopian creators."
                : "Reconnect with local makers and discover beautiful, authentic creations."}
            </p>
          </div>
        </div>

        <section className="auth-card">
          <p className="eyebrow">
            {roleLabel
              ? `${roleLabel.toUpperCase()} ACCOUNT`
              : "WELCOME BACK"}
          </p>

          <h1>
            {roleLabel ? `${roleLabel} Sign In` : "Sign in"}
          </h1>

          <p className="auth-subtitle">
            {roleLabel
              ? `Sign in to your ${roleLabel.toLowerCase()} account.`
              : "Sign in to your Made in Ethiopia account."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">
              Email address

              <input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>

            <label htmlFor="password">
              Password

              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </label>

            {(message || initialMessage) && (
              <p className="form-message form-error">
                {message || initialMessage}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading || cooldown > 0}
            >
              {loading
                ? "Signing in..."
                : cooldown > 0
                ? `Try again in ${cooldown}s`
                : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            className="text-button auth-reset"
            onClick={handleReset}
            disabled={loading || cooldown > 0}
          >
            Forgot your password?
          </button>

          {resetMessage && (
            <p className="form-message">
              {resetMessage}
            </p>
          )}

          <p className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?role=${selectedRole || "customer"}`}
              className="text-link"
            >
              Sign up
            </Link>
          </p>

          <p className="auth-footer">
            <Link href="/" className="text-link">
              ← Back to welcome page
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading login...</p>}>
      <LoginContent />
    </Suspense>
  );
}