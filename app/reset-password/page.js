"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { getPasswordRequirements } from "../../lib/auth/validation";
import { getAuthErrorMessage } from "../../lib/auth/validation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmation || getPasswordRequirements(password).some((item) => !item.valid)) {
      setMessage("Choose a password that meets every requirement and matches the confirmation.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      setMessage(error ? getAuthErrorMessage(error, "This reset link is invalid or expired. Request a new one.") : "Password updated. You can now sign in.");
      if (!error) setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "This reset link is invalid or expired. Request a new one."));
    } finally {
      setSaving(false);
    }
  }

  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Choose a new password</h1><form className="auth-form" onSubmit={submit}><label htmlFor="password">New password<input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><p className="password-requirements">{getPasswordRequirements(password).map((item) => <span className={item.valid ? "requirement valid" : "requirement"} key={item.key}>{item.valid ? "✓" : "○"} {item.label}</span>)}</p><label htmlFor="confirmation">Confirm password<input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>{message && <p className="form-message">{message}</p>}<button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Update password"}</button></form></section></main>;
}
