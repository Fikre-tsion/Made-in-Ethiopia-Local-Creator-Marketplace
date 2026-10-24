"use client";

import { createClient } from "../../lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed. Please try again.");
      return;
    }

    window.location.assign("/login");
  }

  return (
    <button className="small-button" type="button" onClick={handleLogout}>
      Log out
    </button>
  );
}
