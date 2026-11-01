"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

import {
  getAuthErrorMessage,
  getPasswordRequirements,
  validateRegistration,
} from "../../lib/auth/validation";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role =
    searchParams.get("role") === "creator"
      ? "creator"
      : "customer";

  const roleLabel = role === "creator" ? "Creator" : "Customer";

  const destination =
    role === "creator" ? "/dashboard" : "/customer";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Countdown for rate-limited requests
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  // Update form fields
  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setMessage("");
  }

  // Handle registration
  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || cooldown > 0 || confirmationSent) return;

    setLoading(true);
    setMessage("");
    setMessageType("error");

    // Validate inputs
    const errors = validateRegistration(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Redirect users to the correct dashboard
      // after confirming their email
      const emailRedirectTo =
        `${window.location.origin}/auth/callback` +
        `?next=${encodeURIComponent(destination)}`;

      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,

        options: {
          emailRedirectTo,

          data: {
            full_name: form.name.trim(),
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Email confirmation is disabled
      if (data.session) {
        router.replace(destination);
        router.refresh();
        return;
      }

      // Email confirmation is enabled
      setConfirmationSent(true);
      setMessageType("success");

      setMessage(
        "Account created! Please check your email and click the confirmation link to activate your account."
      );

    } catch (error) {
      console.error("Registration error:", error);

      if (
        error?.status === 429 ||
        error?.message?.toLowerCase().includes("rate limit") ||
        error?.message?.toLowerCase().includes("too many")
      ) {
        setCooldown(60);
      }

      setMessageType("error");

      setMessage(
        getAuthErrorMessage(
          error,
          "We could not create your account. Check your details and try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-split">

        {/* LEFT SIDE */}
        <div className="auth-visual">
          <Link href="/" className="auth-brand">
            <span className="brand-mark">M</span>
            Made in Ethiopia
          </Link>

          <div className="auth-visual-copy">
            <p className="eyebrow">JOIN THE COMMUNITY</p>

            <h2>
              {role === "creator"
                ? "Your creativity deserves to be seen."
                : "Discover Ethiopia's creativity."}
            </h2>

            <p>
              {role === "creator"
                ? "Showcase your handmade products, connect with customers, and grow your creative business."
                : "Explore authentic Ethiopian creations, discover local talent, and support handmade craftsmanship."}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <section className="auth-card">

          <p className="eyebrow">
            {roleLabel.toUpperCase()} REGISTRATION
          </p>

          <h1>
            {role === "creator"
              ? "Become a Creator"
              : "Join as a Customer"}
          </h1>

          <p className="auth-subtitle">
            Create your {role} account to get started.
          </p>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* FULL NAME */}
            <label htmlFor="name">
              Full name

              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                disabled={confirmationSent}
                required
              />

              {fieldErrors.name && (
                <span className="field-error">
                  {fieldErrors.name}
                </span>
              )}
            </label>

            {/* EMAIL */}
            <label htmlFor="email">
              Email address

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                disabled={confirmationSent}
                required
              />

              {fieldErrors.email && (
                <span className="field-error">
                  {fieldErrors.email}
                </span>
              )}
            </label>

            {/* PASSWORD */}
            <label htmlFor="password">
              Password

              <span className="password-input">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  disabled={confirmationSent}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </span>

              <span className="password-requirements">
                {getPasswordRequirements(form.password).map(
                  (requirement) => (
                    <span
                      key={requirement.key}
                      className={
                        requirement.valid
                          ? "requirement valid"
                          : "requirement"
                      }
                    >
                      {requirement.valid ? "✓" : "○"}{" "}
                      {requirement.label}
                    </span>
                  )
                )}
              </span>

              {fieldErrors.password && (
                <span className="field-error">
                  {fieldErrors.password}
                </span>
              )}
            </label>

            {/* CONFIRM PASSWORD */}
            <label htmlFor="confirmation">
              Confirm password

              <input
                id="confirmation"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={form.confirmation}
                onChange={(event) =>
                  updateField(
                    "confirmation",
                    event.target.value
                  )
                }
                disabled={confirmationSent}
                required
              />

              {fieldErrors.confirmation && (
                <span className="field-error">
                  {fieldErrors.confirmation}
                </span>
              )}
            </label>

            {/* STATUS MESSAGE */}
            {message && (
              <p
                role="status"
                aria-live="polite"
                className={
                  messageType === "success"
                    ? "form-message"
                    : "form-message form-error"
                }
              >
                {message}
              </p>
            )}

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="primary-button"
              disabled={
                loading ||
                cooldown > 0 ||
                confirmationSent
              }
            >
              {loading
                ? "Creating account..."
                : cooldown > 0
                ? `Try again in ${cooldown}s`
                : confirmationSent
                ? "Check Your Email"
                : `Create ${roleLabel} Account`}
            </button>

          </form>

          {/* EMAIL CONFIRMATION NOTICE */}
          {confirmationSent && (
            <p className="auth-footer">
              Didn't receive the email? Check your spam
              folder or contact support.
            </p>
          )}

          <p className="auth-footer">
            Already have an account?{" "}
            <Link
              href={`/login?role=${role}`}
              className="text-link"
            >
              Sign in
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<p>Loading registration...</p>}>
      <RegisterContent />
    </Suspense>
  );
}