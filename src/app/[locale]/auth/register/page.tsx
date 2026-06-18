'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, ArrowLeft, Loader2, Rocket, Zap, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 'Free',
    icon: Rocket,
    color: 'border-violet-500/40 hover:border-violet-500 data-[selected=true]:border-violet-500 data-[selected=true]:bg-violet-500/10',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$79/mo',
    icon: Zap,
    color: 'border-purple-500/40 hover:border-purple-500 data-[selected=true]:border-purple-500 data-[selected=true]:bg-purple-500/10',
  },
  {
    id: 'agency' as const,
    name: 'Agency',
    price: '$199/mo',
    icon: Building2,
    color: 'border-fuchsia-500/40 hover:border-fuchsia-500 data-[selected=true]:border-fuchsia-500 data-[selected=true]:bg-fuchsia-500/10',
  },
] as const;

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company: z.string().optional(),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    plan: z.enum(['starter', 'pro', 'agency']),
    agreeTerms: z.literal(true, { message: 'You must agree to the terms' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      password: '',
      confirmPassword: '',
      plan: 'pro',
      agreeTerms: undefined as unknown as true,
    },
  });

  const selectedPlan = watch('plan');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company: data.company || '',
            plan: data.plan,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          name: data.name,
          company: data.company || null,
          plan: data.plan,
          scans_this_month: 0,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
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
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-500/20 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
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
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent text-2xl font-bold">
                RankFlow
              </span>
            </Link>
            <CardTitle className="text-xl mt-2">{t('register_title')}</CardTitle>
            <CardDescription>{t('register_subtitle')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')}</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    autoComplete="name"
                    disabled={loading}
                    className={cn(errors.name && 'border-destructive')}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">{t('company')}</Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    autoComplete="organization"
                    disabled={loading}
                    {...register('company')}
                  />
                </div>
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={loading}
                      className={cn('pr-10', errors.confirmPassword && 'border-destructive')}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('select_plan')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      data-selected={selectedPlan === plan.id}
                      onClick={() => setValue('plan', plan.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                        plan.color
                      )}
                    >
                      {plan.id === 'pro' && (
                        <span className="absolute -top-2 text-[10px] bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2 py-0.5 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                      <div className="relative">
                        <div
                          className={cn(
                            'flex size-9 items-center justify-center rounded-lg',
                            selectedPlan === plan.id
                              ? 'bg-violet-500/20 text-violet-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <plan.icon className="size-4" />
                        </div>
                        {selectedPlan === plan.id && (
                          <div className="absolute -top-1 -right-1 size-4 bg-violet-500 rounded-full flex items-center justify-center">
                            <Check className="size-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{plan.name}</p>
                        <p className="text-[10px] text-muted-foreground">{plan.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.plan && (
                  <p className="text-xs text-destructive">{errors.plan.message}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  className="mt-1 size-4 rounded border-input bg-background text-primary focus:ring-ring focus:ring-2"
                  {...register('agreeTerms')}
                />
                <Label htmlFor="agreeTerms" className="text-xs font-normal leading-relaxed cursor-pointer">
                  {t('agree_terms')}
                </Label>
              </div>
              {errors.agreeTerms && (
                <p className="text-xs text-destructive">{errors.agreeTerms.message}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {t('register_btn')}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              {t('has_account')}{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline underline-offset-2"
              >
                {t('login_link')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
