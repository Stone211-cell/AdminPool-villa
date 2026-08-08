import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
  `https://vmbrkqnwqvmonenqfwlc.supabase.co`;

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || "dummy_key_for_build_step";

// Server-side client (for file uploads - uses service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const STORAGE_BUCKET = "house-images";
export const getPublicUrl = (path: string) =>
  `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
