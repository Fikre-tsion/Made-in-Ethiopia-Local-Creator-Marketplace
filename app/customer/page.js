import { Suspense } from "react";
import { connection } from "next/server";
import { requireRole } from "../../lib/auth/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import CustomerDashboardView from "../../components/CustomerDashboardView";
import DemoCustomerDashboard from "../../components/DemoCustomerDashboard";

export const metadata = {
  title: "Customer Dashboard | Made in Ethiopia",
};

// Wait for an actual request before checking authentication
async function AuthenticatedCustomerDashboard() {
  await connection();

  const { user, profile } = await requireRole("customer");

  const name =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Customer";

  return <CustomerDashboardView name={name} />;
}

// Main page with Suspense boundary
export default function CustomerPage() {
  if (!hasSupabaseConfig()) {
    return <DemoCustomerDashboard />;
  }

  return (
    <Suspense
      fallback={
        <main className="customer-dashboard-page">
          <section className="customer-dashboard-container">
            <p>Loading your customer dashboard...</p>
          </section>
        </main>
      }
    >
      <AuthenticatedCustomerDashboard />
    </Suspense>
  );
}