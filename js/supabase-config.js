/**
 * Supabase connection details for ROTO's TCG.
 *
 * The anon key is PUBLIC by design — it is meant to live in client-side code.
 * Security is enforced by Row Level Security policies in the database, not by
 * hiding this key. See supabase/reviews-schema.sql.
 *
 * Never put the `service_role` key in this file. That one bypasses RLS.
 */
window.ROTOS_SUPABASE = {
  url: "https://vcyhutqrnhbeuyrlfrvt.supabase.co",

  // TODO(Ron): paste the full anon key here.
  // Supabase dashboard → Settings → API → Project API keys → `anon` `public`
  // It starts with "eyJhbG" and is roughly 200+ characters long.
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjeWh1dHFybmhiZXV5cmxmcnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMTM5NjAsImV4cCI6MjEwODg4OTk2MH0.MZEt671oHItIhCxQSuCVISofOVqFUv_Sg9-r3_57Udw",
};
