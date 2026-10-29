"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import CustomerDashboardView from "./CustomerDashboardView";

export default function DemoCustomerDashboard() {
  const router = useRouter();
  const [name, setName] = useState(null);

  useEffect(() => {
    let active = true;
    const client = createClient();

    async function check() {
      const { data } = await client.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/login?role=customer&next=/customer");
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("role,display_name")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "customer") {
        router.replace("/dashboard");
        return;
      }

      if (active) setName(profile.display_name || user.email?.split("@")[0] || "Customer");
    }

    check();

    return () => {
      active = false;
    };
  }, [router]);

  if (name === null) return <p>Loading your customer dashboard...</p>;

  return <CustomerDashboardView name={name} />;
}
