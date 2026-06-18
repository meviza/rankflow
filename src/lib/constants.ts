export const SITE_NAME = "RankFlow";

export const SITE_DESCRIPTION = "AI-Powered SEO & GEO Analytics Platform";

export const SITE_URL = "https://rankflow.vercel.app";

export const PACKAGES = [
  {
    tier: "Starter",
    price: "free",
    features: [
      "3 site scans/month",
      "SEO + GEO report",
      "PDF export",
      "Turkish + English",
      "Free AI: Gemini + Groq",
    ],
    highlighted: false,
  },
  {
    tier: "Pro",
    price: "$79/mo",
    features: [
      "4 site scans/month",
      "Detailed SEO + GEO reports",
      "AI improvement roadmap",
      "5 languages",
      "12-month report history",
      "Gemini Flash + Groq + DeepSeek AI",
    ],
    highlighted: true,
  },
  {
    tier: "Agency",
    price: "$199/mo",
    features: [
      "20 site scans/month",
      "Everything in Pro",
      "AI auto-fix & deploy to CMS",
      "10 languages",
      "Unlimited history",
      "White-label reports",
      "All AI models (incl. GLM)",
      "5 team members",
      "API access",
      "Priority support",
    ],
    highlighted: false,
  },
] as const;

export const AI_PROVIDERS = {
  gemini: {
    name: "Gemini Flash",
    modelId: "gemini-2.5-flash",
    cost: 0,
    free: true,
  },
  groq: {
    name: "Groq Llama",
    modelId: "llama-3.3-70b-versatile",
    cost: 0,
    free: true,
  },
  deepseek: {
    name: "DeepSeek",
    modelId: "deepseek-chat",
    cost: 1,
    free: false,
  },
  claude: {
    name: "Claude",
    modelId: "claude-sonnet-4-20250514",
    cost: 3,
    free: false,
  },
  gpt: {
    name: "GPT-4o",
    modelId: "gpt-4o",
    cost: 3,
    free: false,
  },
  glm: {
    name: "GLM-4",
    modelId: "glm-4-plus",
    cost: 2,
    free: false,
  },
} as const;

export const LANGUAGES = [
  { code: "tr", nativeName: "Türkçe" },
  { code: "en", nativeName: "English" },
  { code: "de", nativeName: "Deutsch" },
  { code: "fr", nativeName: "Français" },
  { code: "es", nativeName: "Español" },
  { code: "it", nativeName: "Italiano" },
  { code: "pt", nativeName: "Português" },
  { code: "ru", nativeName: "Русский" },
  { code: "ar", nativeName: "العربية" },
  { code: "zh", nativeName: "中文" },
] as const;
