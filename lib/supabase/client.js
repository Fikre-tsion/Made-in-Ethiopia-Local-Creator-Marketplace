import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseConfig } from "./config";
import { createDemoClient } from "./demo";

export function createClient() {
  if (!hasSupabaseConfig()) return createDemoClient();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
