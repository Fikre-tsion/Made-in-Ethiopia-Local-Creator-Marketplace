"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { getAuthErrorMessage, getPasswordRequirements, validateRegistration } from "../../lib/auth/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmation: "" });
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") return "creator";
    return new URLSearchParams(window.location.search).get("role") === "customer" ? "customer" : "creator";
  });
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
    const errors = validateRegistration(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await createClient().auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: { data: { full_name: form.name.trim(), role } },
      });
      if (error) throw error;
      if (data.session) router.push(role === "creator" ? "/dashboard" : "/customer");
      else setMessage("Account created. Check your email to confirm your account, then sign in.");
    } catch (error) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes("rate limit") || error?.message?.toLowerCase().includes("too many")) {
        setCooldown(60);
      }
      setMessage(getAuthErrorMessage(error, "We could not create your account. Check your details and try again."));
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
            <p className="eyebrow">JOIN THE COMMUNITY</p>
            <h2>Celebrate Ethiopian craftsmanship.</h2>
            <p>Join us in showcasing local makers and connecting with beautiful, authentic creations.</p>
          </div>
        </div>
        <section className="auth-card">
        <p className="eyebrow">JOIN THE COMMUNITY</p>
        <h1>{role === "creator" ? "Become a creator" : "Create your customer account"}</h1>
        <p className="auth-subtitle">Or register as a customer to start exploring.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <fieldset className="role-choice">
            <legend>Account type</legend>
            <label><input type="radio" name="register-role" value="creator" checked={role === "creator"} onChange={() => setRole("creator")} /> Creator</label>
            <label><input type="radio" name="register-role" value="customer" checked={role === "customer"} onChange={() => setRole("customer")} /> Customer</label>
          </fieldset>
          <label htmlFor="name">Full name<input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />{fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}</label>
          <label htmlFor="email">Email<input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</label>
          <label htmlFor="password">Password
            <span className="password-input"><input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></span>
            <span className="password-requirements">{getPasswordRequirements(form.password).map((requirement) => <span className={requirement.valid ? "requirement valid" : "requirement"} key={requirement.key}>{requirement.valid ? "✓" : "○"} {requirement.label}</span>)}</span>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </label>
          <label htmlFor="confirmation">Confirm password<input id="confirmation" type={showPassword ? "text" : "password"} value={form.confirmation} onChange={(event) => setForm({ ...form, confirmation: event.target.value })} required />{fieldErrors.confirmation && <span className="field-error">{fieldErrors.confirmation}</span>}</label>
          {message && <p className="form-message form-error">{message}</p>}
          <button type="submit" className="primary-button" disabled={loading || cooldown > 0}>
            {loading ? "Creating account..." : cooldown > 0 ? `Try again in ${cooldown}s` : "Create account"}
          </button>
        </form>
        <p>Already registered? <Link href="/login" className="text-link">Sign in</Link></p>
        </section>
      </section>
    </main>
  );
}
