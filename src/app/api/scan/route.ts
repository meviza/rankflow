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
