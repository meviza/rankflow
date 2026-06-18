import { NextRequest, NextResponse } from "next/server";

let supabaseAdmin: any = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = require("@supabase/supabase-js");
  supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const client = getSupabaseAdmin();
    if (!client) {
      console.log("Feature request (Supabase not configured):", { name: name.trim(), email: email.trim().toLowerCase() });
      return NextResponse.json({ success: true, message: "Request received (demo mode)" }, { status: 201 });
    }

    const { error } = await client
      .from("feature_requests")
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() });

    if (error) {
      console.error("Failed to insert feature request:", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Feature request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
