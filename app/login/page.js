"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { getAuthErrorMessage } from "../../lib/auth/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("creator");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resetMessage, setResetMessage] = useState("");
  const [nextPath] = useState(() => {
    if (typeof window === "undefined") return "/dashboard";
    const next = new URLSearchParams(window.location.search).get("next");
    return next?.startsWith("/") ? next : "/dashboard";
  });
  const [initialMessage] = useState(() => {
    if (typeof window === "undefined") return "";
    const error = new URLSearchParams(window.location.search).get("error");
    return error === "expired-link" ? "This confirmation or recovery link has expired. Request a new one." : error === "invalid-link" ? "This authentication link is invalid. Request a new one." : error === "service-unavailable" ? "Authentication is temporarily unavailable. Please try again." : "";
  });

  useEffect(() => {
    if (!cooldown) return undefined;
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
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(nextPath === "/dashboard" ? (role === "creator" ? "/dashboard" : "/customer") : nextPath);
      router.refresh();
    } catch (error) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit") || error?.message?.toLowerCase().includes("too many")) {
        setCooldown(60);
      }

      setMessage(getAuthErrorMessage(error, "Unable to sign in. Check your email and password."));
    } finally {
      setLoading(false);
    }

  }

  function openDemo(role) {
    router.push(`/demo/${role}`);
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
      const { error } = await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      setResetMessage(error ? getAuthErrorMessage(error, "We could not send a reset email. Try again.") : "Check your email for a password reset link.");
    } catch (error) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit") || error?.message?.toLowerCase().includes("too many")) {
        setCooldown(60);
      }
      setResetMessage(getAuthErrorMessage(error, "We could not send a reset email. Try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-split">
        <div className="auth-visual">
          <Link href="/" className="auth-brand"><span className="brand-mark">M</span> Made in Ethiopia</Link>
          <div className="auth-visual-copy">
            <p className="eyebrow">WELCOME BACK</p>
            <h2>Continue your Ethiopian story.</h2>
            <p>Reconnect with local makers and discover beautiful, authentic creations.</p>
          </div>
        </div>
        <section className="auth-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Sign in</h1>
          <p className="auth-subtitle">Sign in as a creator or customer to continue exploring.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <fieldset className="role-choice">
              <legend>Account type</legend>
              <label><input type="radio" name="role" value="creator" checked={role === "creator"} onChange={() => setRole("creator")} /> Creator</label>
              <label><input type="radio" name="role" value="customer" checked={role === "customer"} onChange={() => setRole("customer")} /> Customer</label>
            </fieldset>
            <label htmlFor="email">Email address<input id="email" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label htmlFor="password">Password<input id="password" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {(message || initialMessage) && <p className="form-message form-error">{message || initialMessage}</p>}
            <button type="submit" className="primary-button" disabled={loading || cooldown > 0}>
              {loading ? "Signing in..." : cooldown > 0 ? `Try again in ${cooldown}s` : "Sign in"}
            </button>
          </form>
          <button type="button" className="text-button auth-reset" onClick={handleReset} disabled={loading || cooldown > 0}>Forgot your password?</button>
          {resetMessage && <p className="form-message">{resetMessage}</p>}
          <div className="demo-login">
            <p>Want to preview the experience?</p>
            <div>
              <button type="button" onClick={() => openDemo("creator")}>Preview creator dashboard</button>
              <button type="button" onClick={() => openDemo("customer")}>Preview customer dashboard</button>
            </div>
            <small>Demo previews do not create accounts or store credentials.</small>
          </div>
          <p className="auth-footer">New creator? <Link href="/register" className="text-link">Create an account</Link></p>
          <p className="auth-footer">New customer? <Link href="/register?role=customer" className="text-link">Create an account</Link></p>
        </section>
      </section>
    </main>
  );
}
