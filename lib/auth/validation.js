export const passwordRequirements = [
  { key: "length", label: "At least 12 characters", test: (value) => value.length >= 12 },
  { key: "uppercase", label: "At least one uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { key: "lowercase", label: "At least one lowercase letter", test: (value) => /[a-z]/.test(value) },
  { key: "number", label: "At least one number", test: (value) => /\d/.test(value) },
  { key: "special", label: "At least one special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function getPasswordRequirements(value) {
  return passwordRequirements.map((requirement) => ({
    ...requirement,
    valid: requirement.test(value),
  }));
}

export function validateRegistration({ name, email, password, confirmation }) {
  const errors = {};
  if (!name.trim()) errors.name = "Enter your full name.";
  else if (name.trim().length > 100) errors.name = "Your full name is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (password !== confirmation) errors.confirmation = "Passwords do not match.";
  if (getPasswordRequirements(password).some((requirement) => !requirement.valid)) {
    errors.password = "Password does not meet all requirements.";
  }
  return errors;
}

export function getAuthErrorMessage(error, fallback) {
  const message = error?.message?.toLowerCase() || "";
  if (error?.status === 429 || message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  if (message.includes("authentication is not configured") || message.includes("supabase is not configured")) {
    return "Authentication is temporarily unavailable. Check the app configuration and restart the server.";
  }
  if (message.includes("email not confirmed")) return "Confirm your email address before signing in.";
  if (message.includes("invalid login credentials")) return "The email or password is incorrect.";
  if (message.includes("already registered") || message.includes("already exists") || message.includes("user already")) {
    return "This email may already have an account. Try signing in instead.";
  }
  if (message.includes("database error saving new user")) {
    return "Your account could not be saved. Check that the Supabase database setup has been applied.";
  }
  if (message.includes("password")) return "That password does not meet the account security requirements.";
  return fallback;
}
