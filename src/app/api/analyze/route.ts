import { NextResponse } from "next/server";
import { scanWebsite } from "@/lib/scanner/engine";
import { generateReport } from "@/lib/scanner/report-generator";
import { AIProvider, getProviderConfig, ANALYZE_PROMPT } from "@/lib/ai/providers";
import { FixSuggestion } from "@/lib/types";

async function callClaude(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callGPT(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callDeepSeek(prompt: string): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY not configured");

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGLM(prompt: string): Promise<string> {
  const key = process.env.GLM_API_KEY;
  if (!key) throw new Error("GLM_API_KEY not configured");

  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "glm-4-plus",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Zhipu API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

const AI_CALLERS: Record<AIProvider, (prompt: string) => Promise<string>> = {
  claude: callClaude,
  gpt: callGPT,
  deepseek: callDeepSeek,
  glm: callGLM,
};

function parseAIResponse(raw: string): Record<string, unknown> | null {
  const cleaned = raw
    .replace(/```json\s*/i, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
}

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

    if (!["claude", "gpt", "deepseek", "glm"].includes(provider)) {
      return NextResponse.json(
        { success: false, error: "Invalid provider. Choose: claude, gpt, deepseek, glm" },
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
