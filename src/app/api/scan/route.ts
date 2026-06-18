import { NextResponse } from "next/server";
import { scanWebsite } from "@/lib/scanner/engine";
import { generateReport } from "@/lib/scanner/report-generator";
import { AIProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    const { url, provider, language = "en" } = body as {
      url: string;
      provider?: AIProvider;
      language?: string;
    };

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    let scan;
    try {
      scan = await scanWebsite(normalizedUrl);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `Scan failed: ${e instanceof Error ? e.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    if (provider) {
      scan = {
        ...scan,
        provider,
        fixes: scan.fixes.map((f) => ({
          ...f,
          description: f.description + " [AI enhanced]",
        })),
      };
    }

    const reportContent = await generateReport(scan, language);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const authHeader = request.headers.get("authorization");
        let userId: string | null = null;

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.replace("Bearer ", "");
          try {
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) userId = user.id;
          } catch {
            // Not authenticated, continue without user
          }
        }

        const { data: scanData, error: scanError } = await supabase
          .from("scans")
          .insert({
            user_id: userId || "00000000-0000-0000-0000-000000000000",
            url: normalizedUrl,
            status: "completed",
            provider: scan.provider || provider || "gemini",
            language,
            scores: scan.scores,
            report: reportContent,
          })
          .select("id")
          .single();

        if (!scanError && scanData) {
          scan.id = scanData.id;

          if (scan.fixes.length > 0) {
            await supabase.from("fixes").insert(
              scan.fixes.map((fix) => ({
                scan_id: scanData.id,
                type: fix.type,
                severity: fix.severity,
                description: fix.description,
                code: fix.code,
              }))
            );
          }
        }
      } catch (dbError) {
        console.error("Failed to save scan to database:", dbError);
      }
    }

    return NextResponse.json({
      scan,
      report: reportContent,
      success: true,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
