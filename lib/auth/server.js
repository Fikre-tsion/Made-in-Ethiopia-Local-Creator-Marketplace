import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { supabase, user: null, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,display_name,contact_email,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  return { supabase, user, profile };
}

export async function requireRole(role) {
  const auth = await getAuthenticatedProfile();
  if (!auth.user) redirect(`/login?next=/${role === "creator" ? "dashboard" : "customer"}`);
  if (!auth.profile) redirect("/login?error=profile-unavailable");
  if (auth.profile.role !== role) redirect(role === "creator" ? "/customer" : "/dashboard");
  return auth;
}
