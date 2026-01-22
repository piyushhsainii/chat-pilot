import { Database } from "@/lib/supabase/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for usage in standard browser environments
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

/**
 * SSR Helper for Edge/Serverless environments
 * Note: Actual implementation would require access to cookies/headers
 */
export const createSSRClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
