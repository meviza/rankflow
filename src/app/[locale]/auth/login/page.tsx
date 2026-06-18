'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/15 via-teal-500/8 to-transparent blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" />
          {tc('back')}
        </Link>

        <Card className="border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <Link href="/" className="inline-block mx-auto">
              <span className="text-gradient text-2xl font-bold">
                RankFlow
              </span>
            </Link>
            <CardTitle className="text-xl mt-2">{t('login_title')}</CardTitle>
            <CardDescription>{t('login_subtitle')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={loading}
                  className={cn(errors.email && 'border-destructive')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className={cn('pr-10', errors.password && 'border-destructive')}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="size-4 rounded border-input bg-background text-primary focus:ring-ring focus:ring-2"
                  {...register('rememberMe')}
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  {t('remember_me')}
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-11 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                {t('login_btn')}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              {t('no_account')}{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline underline-offset-2"
              >
                {t('sign_up_link')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
