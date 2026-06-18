"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/db/supabase";

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

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? "bg-success"
      : score >= 60
        ? "bg-warning"
        : "bg-destructive";

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    name: string | null;
    plan: string;
    scans_this_month: number;
  } | null>(null);
  const [scans, setScans] = useState<Array<{
    id: string;
    url: string;
    status: string;
    provider: string;
    scores: Record<string, number> | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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

  const planLimit = PLAN_LIMITS[profile?.plan ?? "starter"] ?? 1;
  const scansThisMonth = profile?.scans_this_month ?? 0;
  const scansRemaining = Math.max(0, planLimit - scansThisMonth);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />
            <span className="text-lg font-bold">RankFlow</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
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
                  Manage your SEO scans and reports
                </p>
              </div>
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <Plus className="size-4" />
                  New Scan
                </Button>
              </Link>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Plan
                  </CardTitle>
                  <Badge
                    variant={profile?.plan === "agency" ? "success" : profile?.plan === "pro" ? "warning" : "default"}
                  >
                    {profile?.plan ?? "starter"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {profile?.plan === "starter" && (
                    <p className="text-xs text-muted-foreground">
                      <Link href="/#pricing" className="text-primary hover:underline">
                        Upgrade for more scans →
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Scans This Month
                  </CardTitle>
                  <ScanEye className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scansThisMonth}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}/{" "}{planLimit}
                    </span>
                  </div>
                  {scansRemaining > 0 ? (
                    <p className="text-xs text-success">
                      {scansRemaining} remaining
                    </p>
                  ) : (
                    <p className="text-xs text-destructive">Limit reached</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Scans
                  </CardTitle>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scans.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <CheckCircle2 className="size-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scans.filter((s) => s.status === "completed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Scans</h2>
            </div>

            {scans.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-16">
                <ScanEye className="mb-4 size-12 text-muted-foreground/40" />
                <h3 className="mb-2 text-lg font-medium">
                  Start your first scan!
                </h3>
                <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
                  Enter a website URL to get a comprehensive SEO and GEO analysis
                  report powered by AI.
                </p>
                <Link href="/">
                  <Button size="lg" className="gap-2">
                    <Plus className="size-4" />
                    New Scan
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scans.map((scan) => (
                  <Card key={scan.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate text-base">
                            {scan.url}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(scan.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {" "}·{" "}
                            {new Date(scan.created_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </CardDescription>
                        </div>
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
                          className="ml-2 shrink-0 gap-1"
                        >
                          {STATUS_ICONS[scan.status]}
                          {STATUS_LABELS[scan.status] ?? scan.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {scan.scores && typeof scan.scores === "object" ? (
                        <div className="space-y-1.5">
                          {Object.entries(scan.scores as Record<string, number>)
                            .filter(([key]) => key !== "id" && key !== "scanId")
                            .map(([key, value]) => (
                              <ScoreBar
                                key={key}
                                label={SCORE_LABELS[key] ?? key}
                                score={value}
                              />
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {scan.status === "completed"
                            ? "No scores available"
                            : "Scores will appear when scan completes"}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {scan.provider}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardContent>
                      {scan.status === "completed" ? (
                        <Link href={`/dashboard/reports/${scan.id}`}>
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <FileText className="size-3.5" />
                            View Report
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          {scan.status === "scanning"
                            ? "Scanning..."
                            : scan.status === "pending"
                              ? "Waiting..."
                              : "Failed"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
            </CardContent>
          </Card>
        ))}
      </div>

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
