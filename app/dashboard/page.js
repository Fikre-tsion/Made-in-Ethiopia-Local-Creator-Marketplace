import { hasSupabaseConfig } from "../../lib/supabase/config";
import { requireRole } from "../../lib/auth/server";
import DashboardClient from "../../components/DashboardClient";

export const metadata = { title: "Creator Dashboard | Made in Ethiopia" };
export const instant = false;

export default async function DashboardPage() {
  if (!hasSupabaseConfig()) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card">
          <p className="eyebrow">CREATOR SPACE</p>
          <h1>Creator dashboard</h1>
          <p>Authentication is not configured yet. Add the Supabase environment variables to enable this page.</p>
          <code>NEXT_PUBLIC_SUPABASE_URL<br />NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
        </section>
      </main>
    );
  }

  const { user, profile } = await requireRole("creator");

  return <DashboardClient user={user} profile={profile} />;
}
