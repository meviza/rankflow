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


