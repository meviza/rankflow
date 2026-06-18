"use client"

import { ArrowRight, BarChart3, Globe, FileCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const stats = [
  { icon: BarChart3, label: "AI Models", value: "3" },
  { icon: Globe, label: "Languages", value: "10" },
  { icon: FileCheck, label: "PDF Reports", value: "✓" },
  { icon: Zap, label: "CMS Auto-Fix", value: "✓" },
]

export default function Hero() {
  const router = useRouter()
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 text-center lg:px-8 animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
          <Zap className="size-3" />
          AI-Powered SEO & GEO Platform
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
          Your Website Deserves to Be Found — On{" "}
          <span className="text-gradient">Google & AI</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          SEO isn&apos;t enough anymore. ChatGPT, Gemini and Perplexity are changing how people search. RankFlow helps you optimize for both traditional search engines and AI-powered platforms — all in one dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-12 px-8 text-base bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => router.push("/scan")}
          >
            Start Free Scan
            <ArrowRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base"
            onClick={() => {
              const el = document.getElementById("demo")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
          >
            See Demo Report
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-center"
            >
              <div className="text-2xl font-bold text-emerald-400">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}