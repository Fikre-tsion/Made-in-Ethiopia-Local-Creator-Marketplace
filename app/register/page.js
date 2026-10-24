"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Use a password with at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        window.location.assign("/dashboard");
      } else {
        setMessage(
          "Account request received. Check your email to confirm your account, then log in."
        );
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>Create an account</h1>
      <p>Register as a Made in Ethiopia creator.</p>

      <form className="auth-form" onSubmit={handleRegister}>
        <label htmlFor="fullName">Full name</label>
        <input
          className="auth-input"
          id="fullName"
          name="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          placeholder="Enter your full name"
          required
        />

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

        <label htmlFor="password">Password (minimum 8 characters)</label>
        <input
          className="auth-input"
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          placeholder="Create a password"
          required
        />

        <button
          className="auth-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      <p className="auth-switch">
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}