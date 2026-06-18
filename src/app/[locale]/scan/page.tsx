"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AI_PROVIDERS_CONFIG, type AIProvider } from "@/lib/ai/providers";
import { LANGUAGES } from "@/lib/constants";
import { ScanResult } from "@/lib/types";
import {
  Search,
  Loader2,
  Sparkles,
  Download,
  Shield,
  FileText,
  Layers,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";

type ScanStatus = "idle" | "scanning" | "enhancing" | "done" | "error";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-mono w-8 text-right">{score}</span>
    </div>
  );
}

function ScoreCard({
  icon: Icon,
  label,
  score,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  score: number;
  color: string;
}) {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06]">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`size-5 ${color.replace("bg-", "text-")}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{score}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FixBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[severity] ?? colors.medium}`}>
      {severity}
    </span>
  );
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState<AIProvider>("claude");
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scores" | "fixes" | "report">("scores");
  const [scanProgress, setScanProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulateProgress = useCallback(() => {
    setScanProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          if (progressRef.current) clearInterval(progressRef.current);
          return prev;
        }
        return prev + Math.random() * 15 + 2;
      });
    }, 400);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setScanProgress(100);
  }, []);

  const handleScan = useCallback(async () => {
    if (!url.trim()) return;
    setError(null);
    setScan(null);
    setReport(null);
    setStatus("scanning");
    simulateProgress();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), language }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "Scan failed");
      }
      stopProgress();
      setScan(data.scan);
      setReport(data.report);
      setStatus("done");
    } catch (e) {
      stopProgress();
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }, [url, language, simulateProgress, stopProgress]);

  const handleEnhance = useCallback(async () => {
    if (!scan) return;
    setError(null);
    setStatus("enhancing");
    simulateProgress();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scan.url, provider, language }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error ?? "Enhancement failed");
      }
      stopProgress();
      setScan(data.scan);
      setReport(data.report);
      setStatus("done");
    } catch (e) {
      stopProgress();
      setError(e instanceof Error ? e.message : "AI enhancement failed");
      setStatus("error");
    }
  }, [scan, provider, language, simulateProgress, stopProgress]);

  const handleDownload = useCallback(() => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rankflow-report-${scan?.url ? new URL(scan.url).hostname : "report"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [report, scan]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            SEO & GEO{" "}
            <span className="text-gradient">Scanner</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Enter a URL to get an instant SEO/GEO audit with scores, fixes, and an AI-generated roadmap.
          </p>
        </div>

        <Card className="bg-white/[0.03] border-white/[0.06] mb-8">
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Website URL</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    disabled={status === "scanning" || status === "enhancing"}
                  />
                  {url && !isValidUrl(url) && (
                    <p className="text-xs text-red-400 mt-1">Please enter a valid URL</p>
                  )}
                </div>
                <Button
                  onClick={handleScan}
                  disabled={!isValidUrl(url) || status === "scanning" || status === "enhancing"}
                  className="gap-2"
                >
                  {status === "scanning" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Start Scan
                </Button>
              </div>
            </div>

            {(status === "scanning" || status === "enhancing") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {status === "scanning" ? "Scanning website..." : "Enhancing with AI..."}
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(scanProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <XCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="text-sm font-medium mb-2 block">AI Model</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(AI_PROVIDERS_CONFIG) as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  disabled={status === "scanning" || status === "enhancing"}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === p
                      ? "border-primary bg-primary/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  } disabled:opacity-50`}
                >
                  <p className="text-sm font-medium">{AI_PROVIDERS_CONFIG[p].provider}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {AI_PROVIDERS_CONFIG[p].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Report Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={status === "scanning" || status === "enhancing"}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {scan && status === "done" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {new URL(scan.url).hostname}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Scanned {new Date(scan.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownload} className="gap-2">
                  <Download className="size-4" />
                  Download Report
                </Button>
                <Button onClick={handleEnhance} className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Sparkles className="size-4" />
                  Enhance with AI
                </Button>
              </div>
            </div>

            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-primary" />
                  Overall Score
                </CardTitle>
                <CardDescription>
                  {scan.scores.overall >= 80
                    ? "Great performance! Minor improvements can bring it to excellent."
                    : scan.scores.overall >= 60
                    ? "Good foundation. Medium-level improvements will raise the score."
                    : scan.scores.overall >= 40
                    ? "Moderate performance. Several areas need attention."
                    : "Critical issues detected. Immediate action recommended."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-8">
                <div className="relative size-24 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-secondary"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${scan.scores.overall * 0.973} 97.3`}
                      className={
                        scan.scores.overall >= 80
                          ? "stroke-emerald-500"
                          : scan.scores.overall >= 60
                          ? "stroke-amber-500"
                          : "stroke-red-500"
                      }
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                    {scan.scores.overall}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <ScoreBar label="Technical" score={scan.scores.technical} />
                  <ScoreBar label="OnPage" score={scan.scores.onPage} />
                  <ScoreBar label="Content" score={scan.scores.content} />
                  <ScoreBar label="GEO" score={scan.scores.geo} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ScoreCard icon={Shield} label="Technical" score={scan.scores.technical} color="bg-blue-500" />
              <ScoreCard icon={Layers} label="OnPage" score={scan.scores.onPage} color="bg-cyan-500" />
              <ScoreCard icon={FileText} label="Content" score={scan.scores.content} color="bg-emerald-500" />
              <ScoreCard icon={Zap} label="GEO" score={scan.scores.geo} color="bg-purple-500" />
            </div>

            <Card className="bg-white/[0.03] border-white/[0.06]">
              <div className="border-b border-white/[0.06]">
                <div className="flex">
                  {(["scores", "fixes", "report"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "scores" ? "Scores" : tab === "fixes" ? `Fixes (${scan.fixes.length})` : "Report Preview"}
                    </button>
                  ))}
                </div>
              </div>

              <CardContent className="p-6">
                {activeTab === "scores" && (
                  <div className="space-y-3">
                    {(
                      ["technical", "onPage", "content", "geo", "local", "competitor"] as const
                    ).map((key) => (
                      <ScoreBar
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        score={scan.scores[key]}
                      />
                    ))}
                  </div>
                )}

                {activeTab === "fixes" && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {scan.fixes.length === 0 ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="size-5" />
                        No issues found!
                      </div>
                    ) : (
                      scan.fixes.map((fix) => (
                        <div
                          key={fix.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                        >
                          <div className="shrink-0 mt-0.5">
                            {fix.severity === "critical" || fix.severity === "high" ? (
                              <AlertTriangle className="size-4 text-red-400" />
                            ) : (
                              <AlertTriangle className="size-4 text-amber-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{fix.description}</p>
                            {fix.code && (
                              <pre className="mt-2 p-2 rounded bg-black/30 text-xs text-muted-foreground overflow-x-auto">
                                <code>{fix.code}</code>
                              </pre>
                            )}
                          </div>
                          <FixBadge severity={fix.severity} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "report" && (
                  <div className="prose prose-invert prose-sm max-w-none max-h-96 overflow-y-auto">
                    {report ? (
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-transparent p-0">
                        {report}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground">No report generated yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
