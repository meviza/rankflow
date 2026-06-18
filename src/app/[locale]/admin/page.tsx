"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2,
  Settings,
  Shield,
  X,
  Eye,
  EyeOff,
  Filter,
  Copy,
  CheckCircle2,
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

type Tab = "overview" | "scans" | "users" | "features" | "settings";

interface Scan {
  id: string;
  url: string;
  status: string;
  provider: string;
  created_at: string;
  overall_score?: number;
}

interface FeatureRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalScans: number;
  scansToday: number;
  starter: number;
  pro: number;
  agency: number;
}

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "scans", label: "Scans", icon: Search },
  { id: "users", label: "Users", icon: Users },
  { id: "features", label: "Feature Requests", icon: Lightbulb },
  { id: "settings", label: "Settings", icon: Settings },
];

const providerColors: Record<string, string> = {
  google: "bg-blue-500/10 text-blue-400",
  openai: "bg-emerald-500/10 text-emerald-400",
  pagespeed: "bg-orange-500/10 text-orange-400",
  semrush: "bg-cyan-500/10 text-cyan-400",
  ahrefs: "bg-teal-500/10 text-teal-400",
};

function statusVariant(status: string): "success" | "destructive" | "warning" | "outline" {
  if (status === "completed") return "success";
  if (status === "failed") return "destructive";
  if (status === "scanning" || status === "pending") return "warning";
  return "outline";
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function formatDate(d: string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
        <Badge variant="warning" className="ml-1">Admin</Badge>
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

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartW = 420;
  const chartH = 160;
  const padL = 36;
  const padR = 12;
  const padT = 8;
  const padB = 28;
  const barAreaW = chartW - padL - padR;
  const barAreaH = chartH - padT - padB;
  const barW = barAreaW / data.length * 0.55;
  const gap = barAreaW / data.length;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padT + barAreaH * (1 - pct);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end" fontFamily="inherit">
              {Math.round(maxVal * pct)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = maxVal > 0 ? (d.value / maxVal) * barAreaH : 0;
        const x = padL + gap * i + (gap - barW) / 2;
        const y = padT + barAreaH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill="url(#emeraldGrad)" opacity={d.value > 0 ? 0.9 : 0.2} />
            <text x={padL + gap * i + gap / 2} y={chartH - 6} fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="middle" fontFamily="inherit">
              {d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 4} fill="rgba(16,185,129,0.8)" fontSize="9" textAnchor="middle" fontFamily="inherit" fontWeight="500">
                {d.value}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlanDistribution({ starter, pro, agency, total }: { starter: number; pro: number; agency: number; total: number }) {
  const plans = [
    { label: "Starter", count: starter, color: "bg-emerald-500", textColor: "text-emerald-400", bgTrack: "bg-emerald-500/20" },
    { label: "Pro", count: pro, color: "bg-cyan-500", textColor: "text-cyan-400", bgTrack: "bg-cyan-500/20" },
    { label: "Agency", count: agency, color: "bg-amber-500", textColor: "text-amber-400", bgTrack: "bg-amber-500/20" },
  ];

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const pct = total > 0 ? (plan.count / total) * 100 : 0;
        return (
          <div key={plan.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${plan.textColor}`}>{plan.label}</span>
              <span className="text-muted-foreground">
                {plan.count} user{plan.count !== 1 ? "s" : ""}{" "}
                <span className="text-xs">({pct.toFixed(1)}%)</span>
              </span>
            </div>
            <div className={`h-2.5 w-full overflow-hidden rounded-full ${plan.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${plan.color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverviewSection({ stats, recentScans }: { stats: Stats; recentScans: Scan[] }) {
  const chartData = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      const count = recentScans.filter((s) => s.created_at >= dayStart && s.created_at < dayEnd).length;
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        value: count,
      });
    }
    return days;
  }, [recentScans]);

  const avgScore = useMemo(() => {
    const scored = recentScans.filter((s) => typeof s.overall_score === "number");
    if (scored.length === 0) return null;
    return scored.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) / scored.length;
  }, [recentScans]);

  const revenue = useMemo(() => {
    return stats.starter * 0 + stats.pro * 19 + stats.agency * 49;
  }, [stats]);

  const activePlans = stats.starter + stats.pro + stats.agency;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} accent="emerald" />
        <StatCard title="Total Scans" value={stats.totalScans} icon={ScanEye} accent="cyan" />
        <StatCard title="Scans Today" value={stats.scansToday} icon={CalendarDays} accent="teal" />
        <StatCard title="Active Plans" value={activePlans} subtitle={`${stats.starter}S / ${stats.pro}P / ${stats.agency}A`} icon={TrendingUp} accent="amber" />
        <StatCard title="Revenue Est." value={`$${revenue.toLocaleString()}`} subtitle="/month" icon={DollarSign} accent="emerald" />
        {avgScore !== null && <StatCard title="Avg Score" value={avgScore.toFixed(1)} subtitle="/100" icon={Activity} accent="cyan" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scans Per Day</CardTitle>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </CardHeader>
          <CardContent>
            {chartData.every((d) => d.value === 0) ? (
              <p className="py-12 text-center text-muted-foreground text-sm">No scan data yet</p>
            ) : (
              <BarChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">{activePlans} active subscribers</p>
          </CardHeader>
          <CardContent>
            <PlanDistribution starter={stats.starter} pro={stats.pro} agency={stats.agency} total={stats.totalUsers} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Scans</CardTitle>
          <p className="text-sm text-muted-foreground">Last 10 scans across all users</p>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No scans yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentScans.slice(0, 10).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{scan.url}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(scan.created_at)}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Badge className={providerColors[scan.provider] ?? "bg-secondary text-secondary-foreground"}>
                      {scan.provider}
                    </Badge>
                    <Badge variant={statusVariant(scan.status)}>{scan.status}</Badge>
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

function StatCard({ title, value, subtitle, icon: Icon, accent }: { title: string; value: string | number; subtitle?: string; icon: React.ElementType; accent: string }) {
  const accentMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    teal: "text-teal-400 bg-teal-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };
  const iconAccent = accentMap[accent] ?? accentMap.emerald;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex size-8 items-center justify-center rounded-lg ${iconAccent}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {typeof value === "number" ? formatNumber(value) : value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

type ScanFilter = "all" | "completed" | "failed" | "scanning";

function ScansSection({ scans }: { scans: Scan[] }) {
  const [filter, setFilter] = useState<ScanFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return scans;
    return scans.filter((s) => s.status === filter);
  }, [scans, filter]);

  const filterCounts = useMemo(() => ({
    all: scans.length,
    completed: scans.filter((s) => s.status === "completed").length,
    failed: scans.filter((s) => s.status === "failed").length,
    scanning: scans.filter((s) => s.status === "scanning" || s.status === "pending").length,
  }), [scans]);

  const filters: { key: ScanFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "completed", label: "Completed" },
    { key: "failed", label: "Failed" },
    { key: "scanning", label: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? "" : "text-muted-foreground"}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">({filterCounts[f.key]})</span>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Scans</CardTitle>
          <p className="text-sm text-muted-foreground">Showing {filtered.length} of {scans.length} scans</p>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No scans found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">URL</th>
                    <th className="pb-3 pr-4 font-medium">Provider</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Score</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((scan) => (
                    <ScanRow
                      key={scan.id}
                      scan={scan}
                      expanded={expandedId === scan.id}
                      onToggle={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScanRow({ scan, expanded, onToggle }: { scan: Scan; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggle}>
        <td className="max-w-[280px] truncate py-3 pr-4 font-medium">{scan.url}</td>
        <td className="py-3 pr-4">
          <Badge className={providerColors[scan.provider] ?? "bg-secondary text-secondary-foreground"}>
            {scan.provider}
          </Badge>
        </td>
        <td className="py-3 pr-4">
          <Badge variant={statusVariant(scan.status)}>{scan.status}</Badge>
        </td>
        <td className="py-3 pr-4">
          {scan.overall_score != null ? (
            <span className="font-medium text-emerald-400">{scan.overall_score}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="py-3 text-muted-foreground whitespace-nowrap">
          {formatDate(scan.created_at)}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="bg-muted/30 px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full URL</p>
                <p className="text-sm break-all">{scan.url}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Provider</p>
                <p className="text-sm">{scan.provider}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Scan ID</p>
                <p className="text-sm font-mono text-muted-foreground">{scan.id}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function UsersSection({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Total Users</CardTitle>
            <p className="text-sm text-muted-foreground">Registered accounts</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats.totalUsers.toLocaleString()}</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Starter", count: stats.starter, price: "Free", color: "text-emerald-400", bg: "bg-emerald-500", track: "bg-emerald-500/20" },
          { label: "Pro", count: stats.pro, price: "$19/mo", color: "text-cyan-400", bg: "bg-cyan-500", track: "bg-cyan-500/20" },
          { label: "Agency", count: stats.agency, price: "$49/mo", color: "text-amber-400", bg: "bg-amber-500", track: "bg-amber-500/20" },
        ].map((plan) => {
          const pct = stats.totalUsers > 0 ? (plan.count / stats.totalUsers) * 100 : 0;
          return (
            <Card key={plan.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{plan.label}</CardTitle>
                  <span className={`text-xs font-medium ${plan.color}`}>{plan.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{plan.count.toLocaleString()}</div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${plan.bg}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? `${pct.toFixed(1)}% of users` : "No users yet"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">Breakdown of active subscriptions</p>
        </CardHeader>
        <CardContent>
          <PlanDistribution starter={stats.starter} pro={stats.pro} agency={stats.agency} total={stats.totalUsers} />
        </CardContent>
      </Card>
    </div>
  );
}

function FeaturesSection({ featureRequests }: { featureRequests: FeatureRequest[] }) {
  const [items, setItems] = useState(featureRequests);

  useEffect(() => {
    setItems(featureRequests);
  }, [featureRequests]);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Feature Requests</CardTitle>
        <p className="text-sm text-muted-foreground">
          {items.length} request{items.length !== 1 ? "s" : ""} from users
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No feature requests yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((req) => (
              <div
                key={req.id}
                className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{req.name}</p>
                      <span className="text-xs text-muted-foreground">{req.email}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{req.message}</p>
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={() => handleDelete(req.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SettingsSection() {
  const [secretVisible, setSecretVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const adminSecret = typeof window !== "undefined" ? localStorage.getItem("admin_secret") || "" : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(adminSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [adminSecret]);

  const envItems = [
    { label: "Node Environment", value: "Production" },
    { label: "API Endpoint", value: "/api/admin" },
    { label: "Auth Method", value: "Bearer Token (admin_secret)" },
    { label: "Session Provider", value: "Supabase Auth" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4 text-emerald-400" />
            Authentication
          </CardTitle>
          <p className="text-sm text-muted-foreground">Admin API key and connection status</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Admin Secret Key</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setSecretVisible(!secretVisible)}
                >
                  {secretVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={handleCopy}
                >
                  {copied ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <p className="font-mono text-sm text-muted-foreground rounded-md bg-muted px-3 py-2 break-all">
              {secretVisible ? (adminSecret || "Not set") : (adminSecret ? "••••••••••••••••" : "Not set")}
            </p>
            <p className="text-xs text-muted-foreground">
              This key is stored in localStorage and sent as a Bearer token with API requests.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">API Connection</p>
              <p className="text-xs text-muted-foreground">Authenticated and connected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">Tracking ID</span>
            <span className="text-sm font-medium text-muted-foreground">Not configured</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Connect Google Analytics via the <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_GA_ID</code> environment variable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-1 h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminLoginForm({ onLogin }: { onLogin: (secret: string) => void }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setError("Please enter the admin secret key");
      return;
    }
    onLogin(secret.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
            <Shield className="size-6 text-emerald-400" />
          </div>
          <CardTitle className="text-xl">Admin Access Required</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your admin secret key to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setError(""); }}
                placeholder="Admin secret key"
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Authenticate</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalScans: 0,
    scansToday: 0,
    starter: 0,
    pro: 0,
    agency: 0,
  });
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);

  const fetchData = useCallback(async (adminSecret: string) => {
    try {
      const res = await fetch("/api/admin", {
        headers: adminSecret ? { Authorization: `Bearer ${adminSecret}` } : {},
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data.stats);
      setRecentScans(data.recentScans || []);
      setFeatureRequests(data.featureRequests || []);
      setAuthed(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const adminSecret = localStorage.getItem("admin_secret") || "";
    if (adminSecret) {
      fetchData(adminSecret);
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  const handleLogin = useCallback((secret: string) => {
    localStorage.setItem("admin_secret", secret);
    setLoading(true);
    setError("");
    fetchData(secret);
  }, [fetchData]);

  if (!authed && !loading && !error) {
    return <AdminLoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          {loading ? (
            <AdminSkeleton />
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
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

              {activeTab === "overview" && <OverviewSection stats={stats} recentScans={recentScans} />}
              {activeTab === "scans" && <ScansSection scans={recentScans} />}
              {activeTab === "users" && <UsersSection stats={stats} />}
              {activeTab === "features" && <FeaturesSection featureRequests={featureRequests} />}
              {activeTab === "settings" && <SettingsSection />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}