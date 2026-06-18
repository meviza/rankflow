import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const scanRes = await fetch(
      `${supabaseUrl}/rest/v1/scans?id=eq.${id}&select=*,fixes(*)`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    const scans = await scanRes.json();

    if (!scans || scans.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const scan = scans[0];

    if (typeof scan.scores === "string") {
      try { scan.scores = JSON.parse(scan.scores); } catch {}
    }

    return NextResponse.json({ scan, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch report" },
      { status: 500 }
    );
  }
}