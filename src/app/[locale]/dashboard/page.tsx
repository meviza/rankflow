'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, ScanResult } from '@/lib/types';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        if (profileData) {
          setProfile(profileData as UserProfile);
        }

        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (scanError) {
          console.error('Scans fetch error:', scanError);
        }

        if (scanData) {
          setScans(scanData as ScanResult[]);
        }
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {tc('retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-6 h-16 border-b border-white/5">
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent text-lg font-bold">
              RankFlow
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { icon: LayoutDashboard, label: t('title'), active: true },
              { icon: Search, label: 'Scanner' },
              { icon: TrendingUp, label: 'Analytics' },
              { icon: FileText, label: 'Reports' },
              { icon: BarChart3, label: 'Rankings' },
              { icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.label}
                className={`
                  flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-colors
                  ${item.active
                    ? 'bg-violet-500/10 text-violet-400 font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }
                `}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/5 p-3">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">{t('welcome')}, {profile?.name || user.email}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.company || profile?.email}
                </p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
              >
                <Plus className="size-4" />
                {t('new_scan')}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase tracking-wider">
                      {t('plan')}
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase tracking-wider">
                      {t('scans_used')}
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      {profile?.scansThisMonth ?? 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase tracking-wider">
                      Total Reports
                    </CardDescription>
                    <CardTitle className="text-2xl">{scans.length}</CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">{t('recent_scans')}</h2>

              {scans.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="size-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">{t('no_scans')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {scans.map((scan, i) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="hover:border-violet-500/30 transition-colors">
                        <CardContent className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`
                                flex size-10 shrink-0 items-center justify-center rounded-lg
                                ${scan.status === 'completed'
                                  ? 'bg-green-500/10 text-green-400'
                                  : scan.status === 'failed'
                                  ? 'bg-red-500/10 text-red-400'
                                  : scan.status === 'scanning'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-yellow-500/10 text-yellow-400'
                                }
                              `}
                            >
                              <Search className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{scan.url}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(scan.createdAt).toLocaleDateString()} · {scan.provider}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            {scan.status === 'completed' && scan.scores && (
                              <div className="hidden sm:flex items-center gap-1.5">
                                <div
                                  className={`
                                    text-sm font-bold
                                    ${scan.scores.overall >= 80
                                      ? 'text-green-400'
                                      : scan.scores.overall >= 60
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                    }
                                  `}
                                >
                                  {scan.scores.overall}
                                </div>
                                <span className="text-xs text-muted-foreground">/100</span>
                              </div>
                            )}
                            <Button variant="ghost" size="sm">
                              {t('view_report')}
                              <ExternalLink className="size-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
