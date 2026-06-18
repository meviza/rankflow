"use client"

import { FileText, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const scores = [
  { label: "SEO Score", value: "78", color: "text-emerald-400" },
  { label: "GEO Score", value: "64", color: "text-cyan-400" },
  { label: "Performance", value: "92", color: "text-amber-400" },
  { label: "Accessibility", value: "85", color: "text-sky-400" },
]

const findings = [
  { type: "critical", label: "Missing hreflang tags", count: 3 },
  { type: "warning", label: "Slow LCP on mobile", count: 1 },
  { type: "info", label: "Meta description too long", count: 5 },
]

export default function DemoReport() {
  return (
    <section id="demo" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See What Your{" "}
            <span className="text-gradient">Report</span>{" "}
            Looks Like
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Professional, detailed reports that your clients will love. Here&apos;s a preview of what you get with every scan.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl animate-fade-up">
          <div className="overflow-hidden rounded-xl border border-white/[0.06] shadow-lg">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400" />
                <div className="size-3 rounded-full bg-amber-400" />
                <div className="size-3 rounded-full bg-emerald-400" />
              </div>
              <div className="ml-4 flex items-center gap-2 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                <ExternalLink className="size-3" />
                module-t.de
              </div>
            </div>

            <div className="bg-background p-6 sm:p-8">
              <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
                <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileText className="size-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">SEO & GEO Audit Report</h3>
                  <p className="text-sm text-muted-foreground">module-t.de — Generated June 2026</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {scores.map((score) => (
                  <Card key={score.label} className="border-white/[0.06] bg-white/[0.02] text-center">
                    <CardContent className="p-4">
                      <div className={`text-3xl font-bold ${score.color}`}>{score.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{score.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Key Findings
                </h4>
                <div className="mt-3 space-y-2">
                  {findings.map((finding) => (
                    <div
                      key={finding.label}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-2 shrink-0 rounded-full ${
                            finding.type === "critical"
                              ? "bg-red-500"
                              : finding.type === "warning"
                                ? "bg-amber-500"
                                : "bg-sky-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{finding.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {finding.count} {finding.count === 1 ? "issue" : "issues"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  See Full Report
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}