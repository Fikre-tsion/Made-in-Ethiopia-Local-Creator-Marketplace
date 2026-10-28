"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const { error } = await createClient().auth.signOut();
    if (error) throw error;
    router.push("/");
    router.refresh();
  }
  return <button type="button" className="secondary-button" onClick={handleLogout}>Sign out</button>;
}
