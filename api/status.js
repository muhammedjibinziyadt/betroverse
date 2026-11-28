// Vercel Serverless Function: Supabase Diagnostic & Health Checker
// Tests direct connectivity from server to Supabase without browser CORS restrictions

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-cache, no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://fvbauhcwshgqboakeiux.supabase.co"
  ).trim().replace(/\/+$/, "");

  const supabaseAnonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YmF1aGN3c2hncWJvYWtlaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTM1NjgsImV4cCI6MjEwNjI4OTU2OH0.rZ3RXcEFCrZx96q3m9kafwaAgcAMGGrgiVWvqffks24"
  ).trim();

  let host = "";
  let projectRef = "";
  try {
    const parsed = new URL(supabaseUrl);
    host = parsed.hostname;
    const parts = host.split(".");
    if (parts.length >= 3 && parts[1] === "supabase" && parts[2] === "co") {
      projectRef = parts[0];
    }
  } catch (e) {
    host = supabaseUrl;
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const testRes = await fetch(`${supabaseUrl}/rest/v1/portfolio_projects?limit=1`, {
      method: "GET",
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      },
      signal: controller.signal
    });
    clearTimeout(timer);

    const latency = Date.now() - start;
    return res.status(200).json({
      reachable: true,
      httpStatus: testRes.status,
      host,
      projectRef,
      dashboardUrl: projectRef ? `https://supabase.com/dashboard/project/${projectRef}` : null,
      latency,
      environment: process.env.VERCEL_ENV || "development",
      timestamp: Date.now()
    });
  } catch (err) {
    const latency = Date.now() - start;
    const isDnsError = err.code === "ENOTFOUND" || 
      (err.cause && err.cause.code === "ENOTFOUND") || 
      (err.message && (err.message.includes("fetch failed") || err.message.includes("ENOTFOUND")));

    return res.status(200).json({
      reachable: false,
      isDnsError: Boolean(isDnsError),
      host,
      projectRef,
      dashboardUrl: projectRef ? `https://supabase.com/dashboard/project/${projectRef}` : null,
      latency,
      error: isDnsError 
        ? `DNS hostname "${host}" not found. If this is a free-tier project, Supabase has paused it due to inactivity.`
        : (err.message || "Connection failed"),
      environment: process.env.VERCEL_ENV || "development",
      timestamp: Date.now()
    });
  }
};
