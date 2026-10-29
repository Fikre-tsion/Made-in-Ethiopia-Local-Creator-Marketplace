import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import { requireRole } from "../../lib/auth/server";
import DashboardClient from "../../components/DashboardClient";

export const metadata = {
  title: "Creator Dashboard | Made in Ethiopia",
};

async function AuthenticatedDashboard() {
  // Wait for a real request before accessing authentication.
  await connection();

  const { user, profile } = await requireRole("creator");

  return <DashboardClient user={user} profile={profile} />;
}

export default function DashboardPage() {
  if (!hasSupabaseConfig()) {
    return (
      <main className="dashboard-page demo-page">
        <section className="dashboard-card">
          <p className="eyebrow">CREATOR SPACE</p>

          <h1>Creator Dashboard</h1>

          <p className="demo-description">
            Welcome to your creative space! Manage your products,
            showcase your craftsmanship, and grow your business.
          </p>

          <div className="dashboard-setup-notice">
            <span className="dashboard-setup-icon">⚙️</span>

            <h2>Authentication Setup Required</h2>

            <p>
              Your creator dashboard is ready, but Supabase
              authentication needs to be configured before you
              can access your account.
            </p>

            <div className="dashboard-env-box">
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
              <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
            </div>

            <p className="dashboard-setup-help">
              Add these environment variables to your
              <strong> .env.local </strong>
              file and restart your development server.
            </p>
          </div>

          <div className="demo-actions">
            <Link
              href="/demo/creator"
              className="primary-button"
            >
              Preview Creator Dashboard →
            </Link>

            <Link
              href="/"
              className="demo-outline-button"
            >
              Back to Welcome Page
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <Suspense fallback={<p>Loading creator dashboard...</p>}>
      <AuthenticatedDashboard />
    </Suspense>
  );
}