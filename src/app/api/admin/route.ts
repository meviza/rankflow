import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Auth check: require ADMIN_SECRET in Authorization header
  // Frontend sends: fetch('/api/admin', { headers: { Authorization: `Bearer ${adminSecret}` } })
  const authHeader = request.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET;

  // If ADMIN_SECRET is set in env, require it
  if (adminSecret) {
    if (!authHeader || authHeader.replace("Bearer ", "") !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    // Request total count via Prefer header
    "Prefer": "count=exact",
  };

  try {
    // Fetch profiles, recent scans, and feature requests in parallel
    // Use separate count query for total scans
    const [profilesRes, scansRes, scanCountRes, featureRes] = await Promise.all([
      fetch(`${url}/rest/v1/profiles?select=plan`, { headers }),
      fetch(`${url}/rest/v1/scans?select=id,url,status,provider,created_at&order=created_at.desc&limit=50`, { headers }),
      fetch(`${url}/rest/v1/scans?select=id&limit=0`, { headers }),
      fetch(`${url}/rest/v1/feature_requests?select=id,name,email,message,created_at&order=created_at.desc&limit=20`, { headers }),
    ]);

    const profiles = await profilesRes.json().catch(() => []);
    const scans = await scansRes.json().catch(() => []);
    const featureRequests = await featureRes.json().catch(() => []);

    // Get total scan count from Content-Range header
    const contentRange = scanCountRes.headers.get("content-range");
    const totalScans = contentRange ? parseInt(contentRange.split("/")[1], 10) : scans.length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const stats = {
      totalUsers: profiles.length,
      totalScans,
      scansToday: scans.filter((s: any) => s.created_at >= todayStart).length,
      starter: profiles.filter((p: any) => p.plan === "starter").length,
      pro: profiles.filter((p: any) => p.plan === "pro").length,
      agency: profiles.filter((p: any) => p.plan === "agency").length,
    };

    return NextResponse.json({ stats, recentScans: scans, featureRequests });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}