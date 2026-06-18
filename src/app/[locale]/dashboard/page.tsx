"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  Plus,
  ScanEye,
  TrendingUp,
  Zap,
  AlertTriangle,
  Globe,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Download,
  ArrowUpRight,
  BarChart2,
  Shield,
  LayoutDashboard,
  Sparkles,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 4,
  agency: 20,
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="size-4 text-success" />,
  scanning: <Zap className="size-4 text-warning animate-pulse" />,
  pending: <Globe className="size-4 text-muted-foreground" />,
  failed: <AlertTriangle className="size-4 text-destructive" />,
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  scanning: "Scanning",
  pending: "Pending",
  failed: "Failed",
};

const SCORE_LABELS: Record<string, string> = {
  overall: "Overall",
  technical: "Technical",
  onPage: "On-Page",
  content: "Content",
  geo: "GEO",
  local: "Local",
  competitor: "Competitor",
};

const SCORE_COLORS: Record<string, string> = {
  overall: "text-foreground",
  technical: "text-emerald-500",
  onPage: "text-blue-500",
  content: "text-amber-500",
  geo: "text-violet-500",
  local: "text-rose-500",
  competitor: "text-cyan-500",
};

const BAR_COLORS: Record<string, string> = {
  overall: "bg-foreground",
  technical: "bg-emerald-500",
  onPage: "bg-blue-500",
  content: "bg-amber-500",
  geo: "bg-violet-500",
  local: "bg-rose-500",
  competitor: "bg-cyan-500",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function truncateUrl(url: string, maxLen: number = 36) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const display = u.hostname + u.pathname.replace(/\/$/, "");
    return display.length > maxLen ? display.slice(0, maxLen - 1) + "…" : display;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen - 1) + "…" : url;
  }
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-7 text-right tabular-nums font-medium">{score}</span>
    </div>
  );
}

type Scan = {
  id: string;
  url: string;
  status: string;
  provider: string;
  scores: Record<string, number> | null;
  created_at: string;
  fixes?: Record<string, string[]> | null;
};

type Profile = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  scans_this_month: number;
};

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [isAuthed, setIsAuthed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsAuthed(true);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        const { data: scansData } = await supabase
          .from("scans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (scansData) {
          setScans(scansData);
        }
      } else {
        setIsAuthed(false);
        setProfile({
          id: "",
          email: "demo@rankflow.ai",
          name: "Demo User",
          plan: "starter",
          scans_this_month: 0,
        });
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const completedScans = useMemo(
    () => scans.filter((s) => s.status === "completed"),
    [scans]
  );

  const avgSeoScore = useMemo(() => {
    if (completedScans.length === 0) return 0;
    const total = completedScans.reduce((sum, s) => {
      if (!s.scores) return sum;
      const tech = s.scores.technical ?? 0;
      const onPage = s.scores.onPage ?? 0;
      const content = s.scores.content ?? 0;
      return sum + (tech + onPage + content) / 3;
    }, 0);
    return Math.round(total / completedScans.length);
  }, [completedScans]);

  const avgGeoScore = useMemo(() => {
    if (completedScans.length === 0) return 0;
    const scores = completedScans.filter((s) => s.scores?.geo != null);
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + (s.scores!.geo ?? 0), 0);
    return Math.round(total / scores.length);
  }, [completedScans]);

  const avgByCategory = useMemo(() => {
    if (completedScans.length === 0) return null;
    const cats: Record<string, { total: number; count: number }> = {};
    for (const scan of completedScans) {
      if (!scan.scores) continue;
      for (const [key, val] of Object.entries(scan.scores)) {
        if (key === "overall" || key === "id" || key === "scanId") continue;
        if (typeof val !== "number") continue;
        if (!cats[key]) cats[key] = { total: 0, count: 0 };
        cats[key].total += val;
        cats[key].count += 1;
      }
    }
    const result: Record<string, number> = {};
    for (const [key, { total, count }] of Object.entries(cats)) {
      if (count > 0) result[key] = Math.round(total / count);
    }
    return result;
  }, [completedScans]);

  const recentTrend = useMemo(() => {
    return [...completedScans]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-10);
  }, [completedScans]);

  const commonIssues = useMemo(() => {
    const issueMap: Record<string, number> = {};
    for (const scan of completedScans) {
      if (!scan.fixes || typeof scan.fixes !== "object") continue;
      for (const [, items] of Object.entries(scan.fixes)) {
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          if (typeof item === "string") {
            issueMap[item] = (issueMap[item] || 0) + 1;
          }
        }
      }
    }
    return Object.entries(issueMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }, [completedScans]);

  const planLimit = PLAN_LIMITS[profile?.plan ?? "starter"] ?? 1;
  const scansThisMonth = profile?.scans_this_month ?? 0;
  const scansRemaining = Math.max(0, planLimit - scansThisMonth);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <BarChart3 className="size-6 text-emerald-500" />
            <span className="text-lg font-bold">RankFlow</span>
          </Link>
          <nav className="flex items-center gap-3">
            {isAuthed ? (
              <>
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <span className="text-sm text-muted-foreground">
                    {profile?.name ?? profile?.email}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {(profile?.plan ?? "starter").charAt(0).toUpperCase() + (profile?.plan ?? "starter").slice(1)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut} className="gap-1.5">
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Register</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, {profile?.name ?? "User"}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Manage your SEO & GEO scans and reports
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/${locale}/scan`}>
                  <Button size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="size-4" />
                    New Scan
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg SEO Score
                  </CardTitle>
                  <Activity className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedScans.length > 0 ? (
                      <span className={scoreColor(avgSeoScore)}>{avgSeoScore}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completedScans.length > 0
                      ? `Across ${completedScans.length} completed scan${completedScans.length !== 1 ? "s" : ""}`
                      : "No completed scans yet"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg GEO Score
                  </CardTitle>
                  <Globe className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {avgGeoScore > 0 ? (
                      <span className={scoreColor(avgGeoScore)}>{avgGeoScore}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {avgGeoScore > 0
                      ? "Generative Engine Optimization"
                      : "No GEO data available yet"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Scans
                  </CardTitle>
                  <BarChart2 className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scans.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedScans.length} completed · {scans.filter((s) => s.status === "scanning").length} in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Scans This Month
                  </CardTitle>
                  <ScanEye className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scansThisMonth}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}/{" "}{planLimit}
                    </span>
                  </div>
                  {scansRemaining > 0 ? (
                    <p className="text-xs text-emerald-600">
                      {scansRemaining} remaining this month
                    </p>
                  ) : (
                    <p className="text-xs text-red-500">
                      Limit reached ·{" "}
                      <Link href={`/${locale}/#pricing`} className="underline hover:no-underline">
                        Upgrade
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {recentTrend.length >= 2 && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Score Trend</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Last {recentTrend.length} completed scan{recentTrend.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-32">
                    {recentTrend.map((scan) => {
                      const score = scan.scores?.overall ?? 0;
                      const height = Math.max(score, 4);
                      return (
                        <div key={scan.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                          <span className={`text-xs font-semibold tabular-nums ${scoreColor(score)}`}>
                            {score || "—"}
                          </span>
                          <div
                            className={`w-full rounded-t transition-all ${scoreBg(score || 50)}`}
                            style={{ height: `${(height / 100) * 100}%`, minHeight: 4 }}
                          />
                          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                            {new Date(scan.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Scans</h2>
              <div className="flex gap-2">
                <Link href={`/${locale}/scan`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Plus className="size-3.5" />
                    New Scan
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-1.5" disabled>
                  <Download className="size-3.5" />
                  Export PDF
                </Button>
              </div>
            </div>

            {scans.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
                  <ScanEye className="size-10 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Start Your First Scan
                </h3>
                <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
                  Enter a website URL to get a comprehensive SEO and GEO analysis
                  report powered by AI. See technical, on-page, content, and
                  generative engine optimization scores at a glance.
                </p>
                <Link href={`/${locale}/scan`}>
                  <Button size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="size-4" />
                    New Scan
                  </Button>
                </Link>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {scans.map((scan) => {
                    const overallScore = scan.scores?.overall;
                    return (
                      <Card key={scan.id} className="flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="truncate text-base">
                                {truncateUrl(scan.url)}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {new Date(scan.created_at).toLocaleDateString(
                                  locale === "tr" ? "tr-TR" : "en-US",
                                  { month: "short", day: "numeric", year: "numeric" }
                                )}
                                {" "}·{" "}
                                {new Date(scan.created_at).toLocaleTimeString(
                                  locale === "tr" ? "tr-TR" : "en-US",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                                  scan.status === "completed"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : scan.status === "failed"
                                      ? "bg-red-500/10 text-red-600"
                                      : scan.status === "scanning"
                                        ? "bg-amber-500/10 text-amber-600"
                                        : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {STATUS_ICONS[scan.status]}
                                {STATUS_LABELS[scan.status] ?? scan.status}
                              </span>
                              <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {scan.provider}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                          {scan.status === "completed" && typeof overallScore === "number" ? (
                            <div className="mb-3 flex items-center gap-3">
                              <div
                                className={`flex size-12 items-center justify-center rounded-lg text-lg font-bold ${
                                  overallScore >= 80
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : overallScore >= 60
                                      ? "bg-amber-500/10 text-amber-600"
                                      : "bg-red-500/10 text-red-600"
                                }`}
                              >
                                {overallScore}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium">Overall Score</p>
                                <p className="text-xs text-muted-foreground">
                                  {overallScore >= 80
                                    ? "Good performance"
                                    : overallScore >= 60
                                      ? "Needs improvement"
                                      : "Critical issues found"}
                                </p>
                              </div>
                            </div>
                          ) : null}
                          {scan.scores && typeof scan.scores === "object" ? (
                            <div className="space-y-1.5">
                              {Object.entries(scan.scores as Record<string, number>)
                                .filter(
                                  ([key]) =>
                                    key !== "overall" &&
                                    key !== "id" &&
                                    key !== "scanId"
                                )
                                .slice(0, 4)
                                .map(([key, value]) => (
                                  <ScoreBar
                                    key={key}
                                    label={SCORE_LABELS[key] ?? key}
                                    score={value}
                                  />
                                ))}
                            </div>
                          ) : scan.status !== "completed" ? (
                            <p className="text-sm text-muted-foreground">
                              {scan.status === "scanning"
                                ? "Scanning in progress…"
                                : scan.status === "pending"
                                  ? "Waiting to start…"
                                  : "Scores will appear when complete"}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No scores available
                            </p>
                          )}
                        </CardContent>
                        <CardContent>
                          {scan.status === "completed" ? (
                            <Link href={`/${locale}/dashboard/reports/${scan.id}`}>
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <FileText className="size-3.5" />
                                View Report
                                <ChevronRight className="size-3.5 ml-auto" />
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="outline" size="sm" className="w-full" disabled>
                              {scan.status === "scanning"
                                ? "Scanning…"
                                : scan.status === "pending"
                                  ? "Waiting…"
                                  : "Failed"}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {completedScans.length > 0 && (
                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    {avgByCategory && Object.keys(avgByCategory).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Average Scores by Category</CardTitle>
                          <CardDescription>
                            Aggregate performance across all completed scans
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(avgByCategory)
                            .sort(([, a], [, b]) => a - b)
                            .map(([key, avg]) => (
                              <div key={key} className="flex items-center gap-3">
                                <span className="w-20 text-sm text-muted-foreground">
                                  {SCORE_LABELS[key] ?? key}
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      avg >= 80
                                        ? "bg-emerald-500"
                                        : avg >= 60
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${avg}%` }}
                                  />
                                </div>
                                <span className={`w-8 text-right text-sm font-semibold tabular-nums ${scoreColor(avg)}`}>
                                  {avg}
                                </span>
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">SEO & GEO Insights</CardTitle>
                            <CardDescription>
                              Actionable recommendations based on your scan data
                            </CardDescription>
                          </div>
                          <Sparkles className="size-5 text-emerald-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {commonIssues.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium">Most Common Issues</h4>
                            <ul className="space-y-1.5">
                              {commonIssues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-500" />
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {avgByCategory && (() => {
                          const weakest = Object.entries(avgByCategory)
                            .sort(([, a], [, b]) => a - b)[0];
                          if (!weakest) return null;
                          const [cat, score] = weakest;
                          if (score >= 80) return null;
                          return (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                              <p className="text-sm font-medium text-emerald-600">
                                Enhance with AI
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Your lowest-scoring area is <strong>{SCORE_LABELS[cat] ?? cat}</strong> ({score}/100).
                                Use AI-powered suggestions to improve your {SCORE_LABELS[cat] ?? cat.toLowerCase()} score.
                              </p>
                            </div>
                          );
                        })()}

                        {commonIssues.length === 0 && (!avgByCategory || Object.keys(avgByCategory).every((k) => (avgByCategory?.[k] ?? 0) >= 80)) && (
                          <div className="flex flex-col items-center py-4 text-center">
                            <Shield className="mb-2 size-8 text-emerald-500" />
                            <p className="text-sm font-medium">Looking great!</p>
                            <p className="text-xs text-muted-foreground">
                              No recurring issues detected across your scans.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}

            {completedScans.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                      <CardDescription>Common tasks and shortcuts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Link href={`/${locale}/scan`}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                        <Plus className="size-4 text-emerald-500" />
                        <div className="text-left">
                          <div className="text-sm font-medium">New Scan</div>
                          <div className="text-xs text-muted-foreground">Analyze a new URL</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href={`/${locale}/dashboard/reports/${completedScans[0]?.id ?? ""}`}>
                      <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                        <FileText className="size-4 text-emerald-500" />
                        <div className="text-left">
                          <div className="text-sm font-medium">View Reports</div>
                          <div className="text-xs text-muted-foreground">
                            {completedScans.length} report{completedScans.length !== 1 ? "s" : ""} available
                          </div>
                        </div>
                      </Button>
                    </Link>
                    <Button variant="outline" className="justify-start gap-2 h-auto py-3" disabled>
                      <Download className="size-4 text-emerald-500" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Export PDF</div>
                        <div className="text-xs text-muted-foreground">Coming soon</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-12 border-t border-border pt-4">
              <p className="text-center text-xs text-muted-foreground">
                Your scan data is stored securely and used only for generating reports.{" "}
                We use cookies to improve your experience.{" "}
                <Link href={`/${locale}/privacy`} className="underline hover:no-underline text-muted-foreground">
                  Learn more
                </Link>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-full" />
                  ))}
                </div>
              </CardContent>
              <CardContent>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}