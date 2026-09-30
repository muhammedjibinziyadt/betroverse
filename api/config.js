// Vercel Serverless Function: Environment Configuration Provider
// Safely exposes public Supabase client credentials configured in Vercel Project Settings

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://fvbauhcwshgqboakeiux.supabase.co";

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YmF1aGN3c2hncWJvYWtlaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTM1NjgsImV4cCI6MjEwNjI4OTU2OH0.rZ3RXcEFCrZx96q3m9kafwaAgcAMGGrgiVWvqffks24";

  const storageBucket =
    process.env.SUPABASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
    "betodata";

  res.status(200).json({
    configured: Boolean(supabaseUrl && supabaseAnonKey),
    supabaseUrl: supabaseUrl.trim(),
    supabaseAnonKey: supabaseAnonKey.trim(),
    storageBucket: storageBucket.trim(),
    environment: process.env.VERCEL_ENV || "development",
    timestamp: Date.now()
  });
}
