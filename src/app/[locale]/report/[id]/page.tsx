"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { SEOScores, FixSuggestion } from "@/lib/types";

interface ScanData {
  id: string;
  url: string;
  status: string;
  provider: string;
  language: string;
  scores: SEOScores;
  report: string | null;
  fixes: FixSuggestion[];
  created_at: string;
}

const CATEGORIES: { key: keyof SEOScores; label: string }[] = [
  { key: "technical", label: "Technical SEO" },
  { key: "onPage", label: "On-Page SEO" },
  { key: "content", label: "Content Quality" },
  { key: "geo", label: "GEO" },
  { key: "local", label: "Local SEO" },
  { key: "competitor", label: "Competitor" },
];

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SEVERITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  high: { label: "High", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  medium: { label: "Medium", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  low: { label: "Low", color: "#7a8ba8", bg: "rgba(122,139,168,0.1)" },
};

function getGrade(score: number) {
  if (score >= 80) return { letter: "A", color: "#10b981", description: "Excellent" };
  if (score >= 60) return { letter: "B", color: "#10b981", description: "Good" };
  if (score >= 40) return { letter: "C", color: "#f59e0b", description: "Needs Work" };
  return { letter: "D", color: "#ef4444", description: "Poor" };
}

function getScoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#06b6d4";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/report/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.scan) {
          setScan(data.scan);
        } else {
          setError(data.error || "Report not found");
        }
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !scan) return <ErrorState error={error} />;
  if (!scan.scores) return <ErrorState error="No score data available" />;

  const scores = scan.scores;
  const overallScore = scores.overall ?? 0;
  const grade = getGrade(overallScore);
  const fixes = (scan.fixes ?? []) as FixSuggestion[];
  const sortedFixes = [...fixes].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3));
  const scanDate = new Date(scan.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const domain = (() => {
    try { return new URL(scan.url).hostname; } catch { return scan.url; }
  })();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: white !important; color: #111827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-page { box-shadow: none !important; margin: 0 !important; padding: 24px !important; max-width: 100% !important; }
          .report-card { border: 1px solid #e5e7eb !important; box-shadow: none !important; }
        }
        @media screen {
          .report-page { background: #060d1a; min-height: 100vh; }
        }
      `}</style>

      <div className="report-page" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
        {/* Toolbar — hidden in print */}
        <div className="no-print" style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(6,13,26,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#060d1a", fontWeight: 700, fontSize: 14 }}>
              R
            </div>
            <span style={{ color: "#e8ecf1", fontSize: 14, fontWeight: 600 }}>RankFlow Report</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(16,185,129,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(16,185,129,0.1)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Report content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#060d1a", fontWeight: 800, fontSize: 18 }}>
                R
              </div>
              <div>
                <div style={{ color: "#e8ecf1", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>RankFlow</div>
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
              <div>
                <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>URL</div>
                <div style={{ color: "#e8ecf1", fontSize: 16, fontWeight: 600, wordBreak: "break-all" }}>{scan.url}</div>
              </div>
              <div>
                <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Date</div>
                <div style={{ color: "#e8ecf1", fontSize: 16, fontWeight: 600 }}>{scanDate}</div>
              </div>
              <div>
                <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>AI Provider</div>
                <div style={{ color: "#e8ecf1", fontSize: 16, fontWeight: 600, textTransform: "capitalize" }}>{scan.provider}</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="report-card" style={{
            background: "#0c1629",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 32,
            marginBottom: 32,
          }}>
            <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
              Executive Summary
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
              {/* Score circle */}
              <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="70" cy="70" r="60" fill="none"
                    stroke={grade.color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${overallScore * 3.77} 377`}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ color: "#e8ecf1", fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{overallScore}</div>
                  <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 500, marginTop: 2 }}>/100</div>
                </div>
              </div>
              {/* Grade info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: `${grade.color}20`,
                    border: `2px solid ${grade.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: grade.color, fontSize: 22, fontWeight: 800,
                  }}>
                    {grade.letter}
                  </div>
                  <div>
                    <div style={{ color: "#e8ecf1", fontSize: 18, fontWeight: 700 }}>Grade {grade.letter}</div>
                    <div style={{ color: "#7a8ba8", fontSize: 14 }}>{grade.description}</div>
                  </div>
                </div>
                <p style={{ color: "#7a8ba8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {overallScore >= 80
                    ? "This website demonstrates strong SEO and GEO fundamentals. Minor optimizations could push performance even higher."
                    : overallScore >= 60
                    ? "The website has a solid foundation with room for meaningful improvement across several categories."
                    : overallScore >= 40
                    ? "Significant SEO & GEO issues detected. Prioritizing critical and high-severity fixes will yield the greatest impact."
                    : "Critical issues found that are severely impacting search visibility. Immediate action is recommended."}
                </p>
                <div style={{ display: "flex", gap: "16px", marginTop: 16 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 8, background: `${grade.color}15`, border: `1px solid ${grade.color}30` }}>
                    <div style={{ color: "#7a8ba8", fontSize: 11, fontWeight: 500, textTransform: "uppercase" }}>Total Issues</div>
                    <div style={{ color: "#e8ecf1", fontSize: 20, fontWeight: 700 }}>{fixes.length}</div>
                  </div>
                  <div style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div style={{ color: "#7a8ba8", fontSize: 11, fontWeight: 500, textTransform: "uppercase" }}>Critical</div>
                    <div style={{ color: "#ef4444", fontSize: 20, fontWeight: 700 }}>{fixes.filter((f) => f.severity === "critical").length}</div>
                  </div>
                  <div style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ color: "#7a8ba8", fontSize: 11, fontWeight: 500, textTransform: "uppercase" }}>High</div>
                    <div style={{ color: "#f59e0b", fontSize: 20, fontWeight: 700 }}>{fixes.filter((f) => f.severity === "high").length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="report-card print-break" style={{
            background: "#0c1629",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 32,
            marginBottom: 32,
          }}>
            <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
              Score Breakdown
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {CATEGORIES.map(({ key, label }) => {
                const score = scores[key] ?? 0;
                const color = getScoreColor(score);
                return (
                  <div key={key} style={{
                    padding: 16, borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ color: "#e8ecf1", fontSize: 14, fontWeight: 600 }}>{label}</span>
                      <span style={{ color, fontSize: 18, fontWeight: 700 }}>{score}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: color, width: `${score}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issues and Recommendations */}
          {sortedFixes.length > 0 && (
            <div className="report-card" style={{
              background: "#0c1629",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 32,
              marginBottom: 32,
            }}>
              <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                Issues &amp; Recommendations
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sortedFixes.map((fix, i) => {
                  const sev = SEVERITY_LABELS[fix.severity] ?? SEVERITY_LABELS.low;
                  return (
                    <div key={fix.id || i} style={{
                      padding: 16, borderRadius: 10,
                      background: sev.bg,
                      border: `1px solid ${sev.color}25`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: fix.code ? 8 : 0 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 4,
                          background: `${sev.color}20`,
                          color: sev.color,
                          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        }}>
                          {sev.label}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 4,
                          background: "rgba(255,255,255,0.05)",
                          color: "#7a8ba8",
                          fontSize: 11, fontWeight: 500, textTransform: "capitalize",
                        }}>
                          {fix.type}
                        </span>
                        {fix.applied && (
                          <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>✓ Applied</span>
                        )}
                      </div>
                      <div style={{ color: "#e8ecf1", fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
                        {fix.description}
                      </div>
                      {fix.code && (
                        <pre style={{
                          marginTop: 8, padding: 12, borderRadius: 8,
                          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
                          color: "#7a8ba8", fontSize: 12, lineHeight: 1.5,
                          overflowX: "auto", margin: 0,
                        }}>
                          <code>{fix.code}</code>
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {fixes.length > 0 && (
            <div className="report-card print-break" style={{
              background: "#0c1629",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 32,
              marginBottom: 32,
            }}>
              <div style={{ color: "#7a8ba8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                Improvement Roadmap
              </div>
              {[
                { title: "Phase 1 — Urgent (1–4 Weeks)", filter: (f: FixSuggestion) => f.severity === "critical" || f.severity === "high" },
                { title: "Phase 2 — Structural (1–3 Months)", filter: (f: FixSuggestion) => f.severity === "medium" },
                { title: "Phase 3 — Strategic (3–6 Months)", filter: (f: FixSuggestion) => f.severity === "low" },
              ].map((phase) => {
                const items = fixes.filter(phase.filter);
                if (items.length === 0) return null;
                return (
                  <div key={phase.title} style={{ marginBottom: 24 }}>
                    <div style={{ color: "#e8ecf1", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{phase.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {items.map((fix, i) => (
                        <div key={fix.id || i} style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 14px", borderRadius: 8,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                            background: SEVERITY_LABELS[fix.severity]?.color ?? "#7a8ba8",
                          }} />
                          <div style={{ flex: 1, color: "#e8ecf1", fontSize: 13, lineHeight: 1.5 }}>
                            {fix.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#060d1a", fontWeight: 800, fontSize: 10 }}>
                R
              </div>
              <span style={{ color: "#e8ecf1", fontSize: 14, fontWeight: 700 }}>RankFlow</span>
            </div>
            <div style={{ color: "#7a8ba8", fontSize: 12 }}>
              AI-Powered SEO &amp; GEO Analytics — Generated {scanDate}
            </div>
            <div style={{ color: "#7a8ba8", fontSize: 11, marginTop: 4, opacity: 0.6 }}>
              {domain} · Report ID: {scan.id}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: "#10b981",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#060d1a", fontWeight: 800, fontSize: 18, margin: "0 auto 16px",
        }}>
          R
        </div>
        <div style={{ color: "#7a8ba8", fontSize: 14 }}>Loading report...</div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string | null }) {
  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          border: "2px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#ef4444", fontSize: 24, margin: "0 auto 16px",
        }}>
          ✕
        </div>
        <div style={{ color: "#e8ecf1", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          {error || "Report not found"}
        </div>
        <div style={{ color: "#7a8ba8", fontSize: 14 }}>
          This report may have been deleted or the link is invalid.
        </div>
      </div>
    </div>
  );
}