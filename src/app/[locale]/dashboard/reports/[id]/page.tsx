"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/db/supabase";

const SCORE_LABELS: Record<string, string> = {
  overall: "Overall",
  technical: "Technical SEO",
  onPage: "On-Page SEO",
  content: "Content Quality",
  geo: "GEO",
  local: "Local SEO",
  competitor: "Competitor",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "outline",
};

interface ScanData {
  id: string;
  url: string;
  status: string;
  provider: string;
  language: string;
  scores: Record<string, number> | null;
  report: string | null;
  created_at: string;
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      const supabase = createClient();
      const { data } = await supabase
        .from("scans")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setScan(data);
      }
      setLoading(false);
    }

    if (id) fetchReport();
  }, [id]);

  if (loading) return <ReportSkeleton />;

  if (!scan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <FileText className="mx-auto mb-4 size-12 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-semibold">Report Not Found</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            This report may have been deleted or the URL is invalid.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const scores = (scan.scores ?? {}) as Record<string, number>;
  const overallScore = scores.overall ?? 0;
  const reportData = parseReport(scan.report);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-3.5" />
              Download PDF
            </Button>
            <Link href="/">
              <BarChart3 className="size-6 text-primary" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{scan.url}</h1>
            <Badge
              variant={
                scan.status === "completed"
                  ? "success"
                  : scan.status === "failed"
                    ? "destructive"
                    : scan.status === "scanning"
                      ? "warning"
                      : "outline"
              }
            >
              {scan.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Scanned{" "}
              {new Date(scan.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              AI: <Badge variant="outline" className="text-xs">{scan.provider}</Badge>
            </span>
            <span>·</span>
            <span>Language: {scan.language.toUpperCase()}</span>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-4 flex size-32 items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted/20"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${overallScore * 0.97} 100`}
                    className={
                      overallScore >= 80
                        ? "stroke-success"
                        : overallScore >= 60
                          ? "stroke-warning"
                          : "stroke-destructive"
                    }
                  />
                </svg>
                <span className="absolute text-3xl font-bold">{overallScore}</span>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {overallScore >= 80
                  ? "Great job! Your site is well-optimized."
                  : overallScore >= 60
                    ? "Good foundation. Room for improvement."
                    : "Needs attention. Prioritize critical fixes."}
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(scores)
                .filter(([key]) => key !== "overall")
                .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{SCORE_LABELS[key] ?? key}</span>
                      <span className="font-medium tabular-nums">{value}/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          value >= 80
                            ? "bg-success"
                            : value >= 60
                              ? "bg-warning"
                              : "bg-destructive"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {reportData && (
          <Tabs defaultValue="findings" className="mb-8">
            <TabsList>
              <TabsTrigger value="findings">Findings</TabsTrigger>
              <TabsTrigger value="roadmap">Improvement Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="findings" className="mt-4">
              {reportData.findings.length > 0 ? (
                <div className="grid gap-4">
                  {reportData.findings.map((finding, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-base">{finding.title}</CardTitle>
                          <Badge variant={SEVERITY_COLORS[finding.severity] as "destructive" | "default" | "outline" | "warning" ?? "outline"}>
                            {finding.severity}
                          </Badge>
                        </div>
                        <CardDescription>{finding.description}</CardDescription>
                      </CardHeader>
                      {finding.fix && (
                        <CardContent>
                          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs">
                            <code>{finding.fix}</code>
                          </pre>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 size-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No findings available for this report.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="roadmap" className="mt-4">
              {reportData.roadmap.length > 0 ? (
                <div className="grid gap-4">
                  {["Faz 1: Quick Wins", "Faz 2: Strategic Improvements", "Faz 3: Long-Term Growth"].map(
                    (phase, phaseIdx) => (
                      <Card key={phase}>
                        <CardHeader>
                          <CardTitle className="text-base">{phase}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {reportData.roadmap
                            .filter((_, i) => Math.floor(i / Math.ceil(reportData.roadmap.length / 3)) === phaseIdx)
                            .map((item, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 rounded-lg border border-border p-3"
                              >
                                <div className="mt-0.5">
                                  {item.priority === "critical" ? (
                                    <AlertTriangle className="size-4 text-destructive" />
                                  ) : item.priority === "high" ? (
                                    <Zap className="size-4 text-warning" />
                                  ) : (
                                    <Clock className="size-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.action}</p>
                                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Effort: {item.effort}h</span>
                                    <span>Impact: +{item.impact}</span>
                                    <Badge
                                      variant={SEVERITY_COLORS[item.priority] as "destructive" | "default" | "outline" | "warning" ?? "outline"}
                                      className="text-[10px]"
                                    >
                                      {item.priority}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {reportData.roadmap.filter(
                            (_, i) => Math.floor(i / Math.ceil(reportData.roadmap.length / 3)) === phaseIdx
                          ).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No items in this phase.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <Card className="py-12 text-center">
                  <Globe className="mx-auto mb-4 size-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No roadmap available for this report.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

interface ParsedReport {
  findings: Array<{
    title: string;
    severity: string;
    description: string;
    fix: string | null;
  }>;
  roadmap: Array<{
    action: string;
    priority: string;
    effort: number;
    impact: number;
  }>;
  summary: string;
}

function parseReport(reportText: string | null): ParsedReport | null {
  if (!reportText) return null;

  try {
    const parsed = JSON.parse(reportText);
    return {
      findings: Array.isArray(parsed.findings)
        ? parsed.findings
        : parsed.technical?.issues?.map((issue: string) => ({
            title: issue,
            severity: "medium",
            description: issue,
            fix: null,
          })) ?? [],
      roadmap: Array.isArray(parsed.roadmap)
        ? parsed.roadmap.map((r: { priority?: string; action?: string; effort?: number; impact?: number }) => ({
            action: r.action ?? r.priority ?? "Improvement",
            priority: r.priority?.toLowerCase() ?? "medium",
            effort: r.effort ?? 2,
            impact: r.impact ?? 5,
          }))
        : [],
      summary: parsed.summary ?? "",
    };
  } catch {
    return {
      findings: [],
      roadmap: [],
      summary: reportText,
    };
  }
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Skeleton className="mb-4 size-32 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-72" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
