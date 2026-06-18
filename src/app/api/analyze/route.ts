import { NextResponse } from "next/server";
import { scanWebsite } from "@/lib/scanner/engine";
import { generateReport } from "@/lib/scanner/report-generator";
import { AIProvider, getProviderConfig } from "@/lib/ai/providers";
import { AI_CALLERS, parseAIResponse } from "@/lib/ai/caller";
import { ANALYZE_PROMPT } from "@/lib/ai/prompts";
import { FixSuggestion } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.url || !body.provider) {
      return NextResponse.json(
        { success: false, error: "url and provider are required" },
        { status: 400 }
      );
    }

    const { url, provider, language = "en" } = body as {
      url: string;
      provider: AIProvider;
      language: string;
    };

    if (!["gemini", "groq", "deepseek", "claude", "gpt", "glm"].includes(provider)) {
      return NextResponse.json(
        { success: false, error: "Invalid provider. Choose: gemini, groq, deepseek, claude, gpt, glm" },
        { status: 400 }
      );
    }

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

    const providerConfig = getProviderConfig(provider);

    let scan;
    try {
      scan = await scanWebsite(normalizedUrl);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `Scan failed: ${e instanceof Error ? e.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    const prompt = ANALYZE_PROMPT.replace("{url}", normalizedUrl).replace("{language}", language);

    let aiResponseText: string;
    try {
      const caller = AI_CALLERS[provider];
      aiResponseText = await caller(prompt);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `AI provider error: ${e instanceof Error ? e.message : "Unknown error"}` },
        { status: 502 }
      );
    }

    const aiData = parseAIResponse(aiResponseText) as Record<string, unknown> | null;

    const aiOverall = typeof aiData?.overallScore === "number" ? aiData.overallScore : null;
    const aiTechnical = (aiData?.technical as Record<string, unknown> | undefined)?.score;
    const aiOnPage = (aiData?.onPage as Record<string, unknown> | undefined)?.score;
    const aiContent = (aiData?.content as Record<string, unknown> | undefined)?.score;
    const aiGeo = (aiData?.geo as Record<string, unknown> | undefined)?.score;
    const aiLocal = (aiData?.local as Record<string, unknown> | undefined)?.score;
    const aiCompetitor = (aiData?.competitor as Record<string, unknown> | undefined)?.score;
    const aiRoadmap = Array.isArray(aiData?.roadmap) ? (aiData.roadmap as Array<Record<string, unknown>>) : [];
    const aiSummary = typeof aiData?.summary === "string" ? aiData.summary : "";

    const enhancedScan = {
      ...scan,
      provider,
      scores: {
        ...scan.scores,
        overall: typeof aiOverall === "number" ? aiOverall : scan.scores.overall,
        technical: typeof aiTechnical === "number" ? aiTechnical : scan.scores.technical,
        onPage: typeof aiOnPage === "number" ? aiOnPage : scan.scores.onPage,
        content: typeof aiContent === "number" ? aiContent : scan.scores.content,
        geo: typeof aiGeo === "number" ? aiGeo : scan.scores.geo,
        local: typeof aiLocal === "number" ? aiLocal : scan.scores.local,
        competitor: typeof aiCompetitor === "number" ? aiCompetitor : scan.scores.competitor,
      },
      fixes: [
        ...scan.fixes,
        ...aiRoadmap.map((r, i) => ({
          id: `ai-fix-${i + 1}`,
          type: "geo" as const,
          severity: (typeof r.priority === "string" ? (r.priority as string).toLowerCase() : "medium") as FixSuggestion["severity"],
          description: typeof r.action === "string" ? r.action : "",
          code: null,
          applied: false,
        })),
      ],
    };
    const reportContent = await generateReport(enhancedScan, language);

    const enhancedReport = aiSummary
      ? `## AI Insights\n\n${aiSummary}\n\n---\n\n${reportContent}`
      : reportContent;

    return NextResponse.json({
      scan: enhancedScan,
      report: enhancedReport,
      aiRaw: aiResponseText,
      aiData,
      provider: providerConfig,
      success: true,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 }
    );
  }
}