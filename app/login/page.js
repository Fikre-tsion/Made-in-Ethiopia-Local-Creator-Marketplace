"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

function safeNextPath(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Login failed. Check your email and password.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      window.location.assign(safeNextPath(params.get("next")));
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>Log in</h1>
      <p>Welcome back to Made in Ethiopia.</p>

      <form className="auth-form" onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          className="auth-input"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          className="auth-input"
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />

        <button
          className="auth-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      <p className="auth-switch">
        Need an account? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}