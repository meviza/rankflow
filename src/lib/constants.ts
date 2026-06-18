export const SITE_NAME = "RankFlow";

export const SITE_DESCRIPTION = "AI-Powered SEO & GEO Analytics Platform";

export const SITE_URL = "https://rankflow.vercel.app";

export const PACKAGES = [
  {
    tier: "Starter",
    price: "free",
    features: [
      "1 site scan/month",
      "Basic SEO report",
      "PDF export",
      "Turkish + English",
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
      "Claude + GPT + DeepSeek AI",
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
  claude: {
    name: "Claude",
    modelId: "claude-sonnet-4-20250514",
    cost: 2,
  },
  gpt: {
    name: "GPT",
    modelId: "gpt-4o",
    cost: 3,
  },
  deepseek: {
    name: "DeepSeek",
    modelId: "deepseek-chat",
    cost: 1,
  },
  glm: {
    name: "GLM",
    modelId: "glm-4-plus",
    cost: 2,
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
