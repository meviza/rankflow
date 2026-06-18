export interface SEOScores {
  technical: number;
  onPage: number;
  content: number;
  geo: number;
  local: number;
  competitor: number;
  overall: number;
}

export interface FixSuggestion {
  id: string;
  type: "technical" | "onPage" | "content" | "geo" | "local";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  code: string | null;
  applied: boolean;
}

export interface Report {
  id: string;
  scanId: string;
  title: string;
  summary: string;
  findings: string[];
  roadmap: {
    priority: "critical" | "high" | "medium" | "low";
    action: string;
    effort: number;
    impact: number;
  }[];
  kpis: Record<string, number>;
  language: string;
}

export interface ScanResult {
  id: string;
  url: string;
  createdAt: string;
  status: "pending" | "scanning" | "completed" | "failed";
  scores: SEOScores;
  report: Report | null;
  fixes: FixSuggestion[];
  provider: "claude" | "gpt" | "deepseek" | "glm";
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  company: string | null;
  plan: "starter" | "pro" | "agency";
  scansThisMonth: number;
}
