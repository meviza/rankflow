import { NextResponse } from "next/server";
import { AI_CALLERS, parseAIResponse } from "@/lib/ai/caller";
import { AIProvider, getProviderConfig } from "@/lib/ai/providers";

const AUTOFIX_PROMPT = `You are an expert SEO/GEO developer. A website has been scanned and the following issue was found:

Website URL: {url}
Issue: {description}
Severity: {severity}
Category: {type}

Generate a specific, ready-to-implement fix for this issue. Your response must be in JSON format:

{
  "explanation": "A clear 2-3 sentence explanation of why this is an issue and how the fix resolves it",
  "code": "The actual HTML/CSS/JS/JSON-LD code to implement the fix. Be specific and ready to copy-paste.",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "estimatedImpact": "A brief description of the expected impact on the score"
}

For example:
- If the issue is "Missing meta description", generate the actual HTML meta tag with a suggested description based on the URL
- If the issue is "No H1 tag found", generate the HTML for an appropriate H1
- If the issue is "Missing schema markup", generate the actual JSON-LD schema
- If the issue is "Missing hreflang tags", generate the actual link tags

Be concrete and specific. The fix should be immediately actionable.`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.scanId || !body.fixId) {
      return NextResponse.json(
        { success: false, error: "scanId and fixId are required" },
        { status: 400 }
      );
    }

    const {
      scanId,
      fixId,
      provider = "gemini",
      url,
      description,
      severity,
      type,
    } = body as {
      scanId: string;
      fixId: string;
      provider?: AIProvider;
      url?: string;
      description?: string;
      severity?: string;
      type?: string;
    };

    if (!["gemini", "groq", "deepseek", "claude", "gpt", "glm"].includes(provider)) {
      return NextResponse.json(
        { success: false, error: "Invalid provider. Choose: gemini, groq, deepseek, claude, gpt, glm" },
        { status: 400 }
      );
    }

    let scanUrl = url ?? "";
    let fixDescription = description ?? "";
    let fixSeverity = severity ?? "medium";
    let fixType = type ?? "technical";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: scanData } = await supabase
          .from("scans")
          .select("url, scores")
          .eq("id", scanId)
          .single();

        if (scanData) {
          if (!scanUrl) scanUrl = scanData.url;

          const { data: fixData } = await supabase
            .from("fixes")
            .select("description, severity, type, code")
            .eq("scan_id", scanId)
            .eq("id", fixId)
            .single();

          if (fixData) {
            if (!fixDescription) fixDescription = fixData.description;
            if (fixSeverity === "medium") fixSeverity = fixData.severity;
            if (fixType === "technical") fixType = fixData.type;
          }
        }
      } catch (dbError) {
        console.error("Database lookup failed:", dbError);
      }
    }

    if (!fixDescription) {
      return NextResponse.json(
        { success: false, error: "Could not determine the issue. Provide a description." },
        { status: 400 }
      );
    }

    if (!scanUrl) {
      return NextResponse.json(
        { success: false, error: "Could not determine the URL. Provide a url parameter." },
        { status: 400 }
      );
    }

    getProviderConfig(provider);

    const prompt = AUTOFIX_PROMPT
      .replace("{url}", scanUrl)
      .replace("{description}", fixDescription)
      .replace("{severity}", fixSeverity)
      .replace("{type}", fixType);

    let aiResponseText: string;
    try {
      const caller = AI_CALLERS[provider];
      aiResponseText = await caller(prompt);
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: `AI provider error: ${e instanceof Error ? e.message : "Unknown error"}. Try again or use a different provider.`,
        },
        { status: 502 }
      );
    }

    const aiData = parseAIResponse(aiResponseText);

    if (!aiData) {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned an invalid response. Please try again.",
          raw: aiResponseText,
        },
        { status: 502 }
      );
    }

    const code = typeof aiData.code === "string" ? aiData.code : JSON.stringify(aiData.code ?? "", null, 2);
    const explanation = typeof aiData.explanation === "string" ? aiData.explanation : "";
    const steps = Array.isArray(aiData.steps) ? aiData.steps : [];
    const estimatedImpact = typeof aiData.estimatedImpact === "string" ? aiData.estimatedImpact : "";

    return NextResponse.json({
      success: true,
      code,
      explanation,
      steps,
      estimatedImpact,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 }
    );
  }
}