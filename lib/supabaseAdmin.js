import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn("SUPABASE_URL ist nicht gesetzt. Favoriten-API wird nicht funktionieren.");
}

if (!supabaseServiceKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt. Schreibzugriffe auf Favoriten funktionieren nicht."
  );
}

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;


