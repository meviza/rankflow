"use client"

import { useState } from "react"
import { Check, Zap, Building2, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Perfect for trying out RankFlow",
    icon: Rocket,
    popular: false,
    features: [
      "3 website scans per month",
      "Basic SEO + GEO audit",
      "Free AI: Gemini + Groq",
      "3 languages",
      "Email support",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    priceMonthly: 79,
    priceYearly: 69,
    description: "For professionals and small teams",
    icon: Zap,
    popular: true,
    features: [
      "10 website scans per month",
      "Full SEO + GEO audit",
      "AI roadmap with tasks",
      "PDF reports",
      "All 10 languages",
      "Priority support",
    ],
    cta: "Start Pro",
  },
  {
    name: "Agency",
    priceMonthly: 199,
    priceYearly: 179,
    description: "For agencies managing multiple clients",
    icon: Building2,
    popular: false,
    features: [
      "Unlimited website scans",
      "Everything in Pro",
      "White-label reports",
      "CMS auto-fix (WordPress, Webflow)",
      "Team accounts",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Start Agency",
  },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const router = useRouter()

  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent{" "}
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={cn("text-sm font-medium", !yearly && "text-foreground", yearly && "text-muted-foreground")}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly(!yearly)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-emerald-600 transition-colors"
          >
            <span
              className={cn(
                "pointer-events-none block size-5 rounded-full bg-white shadow-lg transition-transform",
                yearly ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium", yearly && "text-foreground", !yearly && "text-muted-foreground")}>
            Yearly{" "}
            <span className="text-xs text-emerald-400 font-semibold">Save 12%</span>
          </span>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col h-full transition-all duration-300 hover:shadow-lg border-white/[0.06] bg-white/[0.02]",
                plan.popular && "border-emerald-500/40 shadow-lg shadow-emerald-500/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-lg bg-muted",
                    plan.popular && "bg-emerald-500/10 text-emerald-400"
                  )}>
                    <plan.icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.priceMonthly === 0 ? "Free" : `$${yearly ? plan.priceYearly : plan.priceMonthly}`}
                  </span>
                  {plan.priceMonthly > 0 && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  size="lg"
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => router.push("/auth/register")}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}