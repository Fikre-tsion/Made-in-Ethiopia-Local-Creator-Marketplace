import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  hasSupabaseConfig,
  supabaseConfigError,
} from "./config";

export async function createClient() {
  // Check whether Supabase is configured
  if (!hasSupabaseConfig()) {
    throw new Error(supabaseConfigError);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie writes may be unavailable in Server Components.
          // Session refresh should be handled by middleware/proxy.
        }
      },
    },
  });
}