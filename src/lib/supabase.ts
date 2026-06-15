import { createClient } from "@supabase/supabase-js";

// Uses the environment variables starting with VITE_ which are exposed to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL and Anon Key are missing. Please add them to your environment variables.");
}

// Custom lock implementation to prevent "Lock was released because another request stole it" error in multiple tabs/iframes
const bypassLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  return await fn();
};

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: bypassLock,
    },
  }
);

