export type AIProvider = "gemini" | "groq" | "deepseek" | "claude" | "gpt" | "glm";

export interface AIProviderConfig {
  provider: string;
  model: string;
  cost: number;
  free: boolean;
  description: string;
  endpoint: string;
}

export const AI_PROVIDERS_CONFIG: Record<AIProvider, AIProviderConfig> = {
  gemini: {
    provider: "google",
    model: "gemini-2.5-flash",
    cost: 0,
    free: true,
    description: "Free — Google Gemini Flash, 1500 req/day",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  },
  groq: {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    cost: 0,
    free: true,
    description: "Free — Groq Llama 3.3 70B, 1000 req/day",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
  },
  deepseek: {
    provider: "deepseek",
    model: "deepseek-chat",
    cost: 1,
    free: false,
    description: "Cheap — DeepSeek V3, $0.27/M tokens",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
  },
  claude: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    cost: 3,
    free: false,
    description: "Premium — Claude Sonnet, best analysis",
    endpoint: "https://api.anthropic.com/v1/messages",
  },
  gpt: {
    provider: "openai",
    model: "gpt-4o",
    cost: 3,
    free: false,
    description: "Premium — GPT-4o, fast content generation",
    endpoint: "https://api.openai.com/v1/chat/completions",
  },
  glm: {
    provider: "zhipu",
    model: "glm-4-plus",
    cost: 2,
    free: false,
    description: "Premium — GLM-4, best for Asian languages",
    endpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  },
};

export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_PROVIDERS_CONFIG[provider];
}

export const ANALYZE_PROMPT = `You are an expert SEO and GEO (Generative Engine Optimization) analyst. Analyze the following website and provide a comprehensive report.

Website URL: {url}
Report Language: {language}

Provide your analysis in the following structured format:

## Overall Score
A score from 0-100 representing the site's overall SEO/GEO health.

## Technical SEO
- Crawlability and indexability issues
- Site speed and Core Web Vitals assessment
- Mobile responsiveness
- SSL/HTTPS status
- XML sitemap and robots.txt evaluation
- Structured data/schema markup presence

## On-Page SEO
- Title tags and meta descriptions quality
- Heading structure (H1-H6 hierarchy)
- URL structure and permalink optimization
- Internal linking strategy
- Image alt text and optimization
- Keyword placement and density

## Content Quality
- Content depth and comprehensiveness
- Readability and user engagement signals
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Content freshness and update frequency
- Duplicate content risks

## GEO (Generative Engine Optimization)
- AI overview/snippet visibility potential
- Cited-source optimization
- Conversational query alignment
- Entity and topic authority signals
- Structured data for AI engines
- Natural language processing readiness

## Local SEO (if applicable)
- Google Business Profile optimization
- NAP consistency
- Local citation opportunities
- Review signals and reputation

## Competitor Gap Analysis
- Top 3 competitors to benchmark against
- Keywords competitors rank for that you don't
- Content gaps and opportunities
- Backlink comparison

## Actionable Recommendations
Provide a prioritized list of fixes and improvements, each with:
- Priority (Critical / High / Medium / Low)
- Estimated effort (hours)
- Expected impact (score improvement)
- Implementation guidance

Return the response as valid JSON matching this structure:
{
  "overallScore": number,
  "technical": { "score": number, "issues": string[], "recommendations": string[] },
  "onPage": { "score": number, "issues": string[], "recommendations": string[] },
  "content": { "score": number, "issues": string[], "recommendations": string[] },
  "geo": { "score": number, "issues": string[], "recommendations": string[] },
  "local": { "score": number, "issues": string[], "recommendations": string[] },
  "competitor": { "score": number, "insights": string[] },
  "roadmap": [{ "priority": string, "action": string, "effort": number, "impact": number }],
  "summary": string
}`;
