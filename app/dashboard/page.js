import { Suspense } from "react";
import { connection } from "next/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import { requireRole } from "../../lib/auth/server";
import DashboardClient from "../../components/DashboardClient";
import DemoCreatorDashboard from "../../components/DemoCreatorDashboard";

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
      <DemoCreatorDashboard />
    );
  }

  return (
    <Suspense fallback={<p>Loading creator dashboard...</p>}>
      <AuthenticatedDashboard />
    </Suspense>
  );
}