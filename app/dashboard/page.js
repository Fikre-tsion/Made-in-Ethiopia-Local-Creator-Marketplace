import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LogoutButton from "../components/LogoutButton";

export const metadata = {
  title: "Creator Dashboard",
};

export const instant = false;

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="dashboard-page"><p>Loading dashboard...</p></main>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: shops, error: shopsError } = await supabase
    .from("shops")
    .select("id, name, description, location, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="dashboard-page">
      <h1>Creator Dashboard</h1>

      <p>
        Welcome, {user.user_metadata?.full_name || user.email}!
      </p>

      <LogoutButton />

      <section>
        <h2>My Shops</h2>

        {shopsError ? (
          <p>Unable to load your shops. Please try again later.</p>
        ) : !shops || shops.length === 0 ? (
          <p>You have not created a shop yet.</p>
        ) : (
          <ul>
            {shops.map((shop) => (
              <li key={shop.id}>
                <h3>{shop.name}</h3>
                <p>{shop.description || "No description provided."}</p>
                <p>{shop.location || "Location not provided."}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}