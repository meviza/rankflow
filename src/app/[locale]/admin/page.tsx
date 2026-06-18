"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  BarChart3,
  Users,
  ScanEye,
  TrendingUp,
  CalendarDays,
  ArrowLeft,
  LayoutDashboard,
  Search,
  Lightbulb,
  Menu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

type Tab = "overview" | "scans" | "users" | "features";

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "scans", label: "Scans", icon: Search },
  { id: "users", label: "Users", icon: Users },
  { id: "features", label: "Feature Requests", icon: Lightbulb },
];

const providerColors: Record<string, string> = {
  google: "bg-blue-500/10 text-blue-500",
  openai: "bg-green-500/10 text-green-500",
  pagespeed: "bg-orange-500/10 text-orange-500",
  semrush: "bg-purple-500/10 text-purple-500",
  ahrefs: "bg-cyan-500/10 text-cyan-500",
};

function statusVariant(status: string): "success" | "destructive" | "warning" | "outline" {
  if (status === "completed") return "success";
  if (status === "failed") return "destructive";
  if (status === "scanning") return "warning";
  return "outline";
}

function SidebarNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const locale = useLocale();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <BarChart3 className="size-6 text-primary" />
        <span className="text-lg font-bold">RankFlow</span>
        <Badge variant="warning" className="ml-1">
          Admin
        </Badge>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <Link href={`/${locale}/dashboard`}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to Site
          </button>
        </Link>
      </div>
    </div>
  );
}

function OverviewSection({
  stats,
  recentScans,
}: {
  stats: {
    totalUsers: number;
    totalScans: number;
    scansToday: number;
    starter: number;
    pro: number;
    agency: number;
  };
  recentScans: Array<{
    id: string;
    url: string;
    status: string;
    provider: string;
    created_at: string;
  }>;
}) {
  const activePlans = stats.starter + stats.pro + stats.agency;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats.totalUsers.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Scans
            </CardTitle>
            <ScanEye className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats.totalScans.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scans Today
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats.scansToday.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {activePlans.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { label: "Starter", count: stats.starter, color: "bg-primary" },
            { label: "Pro", count: stats.pro, color: "bg-warning" },
            { label: "Agency", count: stats.agency, color: "bg-success" },
          ].map((plan) => (
            <div key={plan.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{plan.label}</span>
                <span className="text-muted-foreground">
                  {plan.count} user{plan.count !== 1 ? "s" : ""}
                  {stats.totalUsers > 0 && (
                    <span className="ml-1">
                      ({((plan.count / stats.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${plan.color}`}
                  style={{
                    width:
                      stats.totalUsers > 0
                        ? `${(plan.count / stats.totalUsers) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <p className="text-sm text-muted-foreground">Last 10 scans</p>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No scans yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentScans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{scan.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Badge
                      className={
                        providerColors[scan.provider] ?? "bg-secondary text-secondary-foreground"
                      }
                    >
                      {scan.provider}
                    </Badge>
                    <Badge variant={statusVariant(scan.status)}>
                      {scan.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScansSection({
  scans,
}: {
  scans: Array<{
    id: string;
    url: string;
    status: string;
    provider: string;
    created_at: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Scans</CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent scan activity across all users
        </p>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No scans yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">URL</th>
                  <th className="pb-3 pr-4 font-medium">Provider</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scans.map((scan) => (
                  <tr key={scan.id}>
                    <td className="max-w-[300px] truncate py-3 pr-4 font-medium">
                      {scan.url}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={
                          providerColors[scan.provider] ??
                          "bg-secondary text-secondary-foreground"
                        }
                      >
                        {scan.provider}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant(scan.status)}>
                        {scan.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(scan.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UsersSection({
  stats,
}: {
  stats: {
    totalUsers: number;
    starter: number;
    pro: number;
    agency: number;
  };
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">
            {stats.totalUsers.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Starter", count: stats.starter, color: "bg-primary", textColor: "text-primary" },
          { label: "Pro", count: stats.pro, color: "bg-warning", textColor: "text-warning" },
          { label: "Agency", count: stats.agency, color: "bg-success", textColor: "text-success" },
        ].map((plan) => (
          <Card key={plan.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {plan.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {plan.count.toLocaleString()}
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${plan.color}`}
                  style={{
                    width:
                      stats.totalUsers > 0
                        ? `${(plan.count / stats.totalUsers) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats.totalUsers > 0
                  ? `${((plan.count / stats.totalUsers) * 100).toFixed(1)}% of users`
                  : "No users yet"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection({
  featureRequests,
}: {
  featureRequests: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Requests</CardTitle>
        <p className="text-sm text-muted-foreground">
          Feedback and feature requests from users
        </p>
      </CardHeader>
      <CardContent>
        {featureRequests.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No feature requests yet.
          </p>
        ) : (
          <div className="space-y-4">
            {featureRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{req.name}</p>
                    <p className="text-sm text-muted-foreground">{req.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-sm">{req.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    scansToday: 0,
    starter: 0,
    pro: 0,
    agency: 0,
  });
  const [recentScans, setRecentScans] = useState<
    Array<{
      id: string;
      url: string;
      status: string;
      provider: string;
      created_at: string;
    }>
  >([]);
  const [featureRequests, setFeatureRequests] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      message: string;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const adminSecret =
          typeof window !== "undefined"
            ? localStorage.getItem("admin_secret") || ""
            : "";
        const res = await fetch("/api/admin", {
          headers: adminSecret
            ? { Authorization: `Bearer ${adminSecret}` }
            : {},
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
        setRecentScans(data.recentScans || []);
        setFeatureRequests(data.featureRequests || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          {loading ? (
            <AdminSkeleton />
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3 md:hidden">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-primary" />
                  <span className="font-bold">Admin</span>
                </div>
              </div>

              {activeTab === "overview" && (
                <OverviewSection stats={stats} recentScans={recentScans} />
              )}
              {activeTab === "scans" && <ScansSection scans={recentScans} />}
              {activeTab === "users" && <UsersSection stats={stats} />}
              {activeTab === "features" && (
                <FeaturesSection featureRequests={featureRequests} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-8">
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

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}