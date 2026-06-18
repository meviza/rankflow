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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
export default function AdminPage() {
  const locale = useLocale();
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
  const [recentScans, setRecentScans] = useState<Array<{
    id: string;
    url: string;
    status: string;
    provider: string;
    created_at: string;
  }>>([]);
  const [featureRequests, setFeatureRequests] = useState<Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
  }>>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const adminSecret = localStorage.getItem("admin_secret") || "";
        const res = await fetch("/api/admin", {
          headers: adminSecret ? { Authorization: `Bearer ${adminSecret}` } : {},
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
        setRecentScans(data.recentScans || []);
        setFeatureRequests(data.featureRequests || []);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />
            <span className="text-lg font-bold">RankFlow</span>
            <Badge variant="warning" className="ml-2">Admin</Badge>
          </div>
          <nav className="flex items-center gap-3">
            <Link href={`/${locale}/dashboard`}>
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href={`/${locale}`}>
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Admin Panel</h1>

        {loading ? (
          <AdminSkeleton />
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
                  <div className="text-2xl font-bold">{stats.totalScans}</div>
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
                  <div className="text-2xl font-bold">{stats.scansToday}</div>
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
                  <div className="text-2xl font-bold">
                    {stats.starter + stats.pro + stats.agency}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Plan Distribution</h2>
              <div className="flex gap-4">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Starter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.starter}</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: stats.totalUsers > 0
                            ? `${(stats.starter / stats.totalUsers) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pro}</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-warning transition-all"
                        style={{
                          width: stats.totalUsers > 0
                            ? `${(stats.pro / stats.totalUsers) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Agency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.agency}</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: stats.totalUsers > 0
                            ? `${(stats.agency / stats.totalUsers) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Recent Scans</h2>
              <Card>
                <div className="divide-y divide-border">
                  {recentScans.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No scans yet.
                    </div>
                  ) : (
                    recentScans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between px-6 py-4"
                      >
                        <div className="flex-1 min-w-0">
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
                        <div className="flex items-center gap-3 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {scan.provider}
                          </Badge>
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
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Feature Requests</h2>
              <Card>
                <div className="divide-y divide-border">
                  {featureRequests.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No feature requests yet.
                    </div>
                  ) : (
                    featureRequests.map((req) => (
                      <div key={req.id} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <p className="text-sm font-medium">{req.name}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1.5">{req.email}</p>
                        <p className="text-sm">{req.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
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

      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex-1">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
                <Skeleton className="mt-2 h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <Card>
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
