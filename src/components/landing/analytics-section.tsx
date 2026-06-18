"use client"

import { BarChart3, Megaphone, Search, ArrowRight } from "lucide-react"

const integrations = [
  {
    icon: BarChart3,
    title: "Google Analytics",
    description: "Connect your GA4 property to see traffic data, user behavior, and conversion metrics alongside your SEO scores.",
    status: "connect" as const,
    href: "#",
  },
  {
    icon: Megaphone,
    title: "Google Ads",
    description: "Import your ad campaign data to correlate paid traffic with organic performance and identify keyword opportunities.",
    status: "coming" as const,
    href: "#",
  },
  {
    icon: Search,
    title: "Search Console",
    description: "Sync your Google Search Console data for real-time indexing status, search performance, and crawl error monitoring.",
    status: "coming" as const,
    href: "#",
  },
]

export default function AnalyticsSection() {
  return (
    <section id="integrations" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Connect Your{" "}
            <span className="text-gradient">Data Sources</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Link your marketing tools to get a complete picture of your website&apos;s performance. Data-driven decisions start with connected data.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.04]"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-4">
                {item.status === "connect" ? (
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Connect
                    <ArrowRight className="size-3.5" />
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}