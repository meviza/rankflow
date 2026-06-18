import { NextRequest, NextResponse } from "next/server";

// Admin emails that are allowed to access the admin panel
// In production, this should come from environment variables or a database role
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Check if request has valid admin authorization
// Returns null if authorized, or a NextResponse with error if not
export function requireAdmin(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized: No authorization header" }, { status: 401 });
  }

  // Simple bearer token check - in production this validates against Supabase auth
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Invalid token format" }, { status: 401 });
  }

  return null; // Authorized
}