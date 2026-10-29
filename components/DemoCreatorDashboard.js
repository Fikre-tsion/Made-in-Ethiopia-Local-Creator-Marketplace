"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import DashboardClient from "./DashboardClient";

export default function DemoCreatorDashboard() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, user: null, profile: null });

  useEffect(() => {
    let active = true;
    const client = createClient();

    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login?next=/dashboard");
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("role,display_name")
        .eq("id", data.user.id)
        .single();

      if (!active) return;
      if (profile?.role !== "creator") {
        router.replace("/customer");
        return;
      }
      setState({ loading: false, user: data.user, profile });
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (state.loading) {
    return <main className="dashboard-page"><section className="dashboard-card"><p>Loading creator dashboard...</p></section></main>;
  }

  return <DashboardClient user={state.user} profile={state.profile} />;
}
