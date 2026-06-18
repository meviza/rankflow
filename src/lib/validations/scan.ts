import { z } from "zod";

export const scanRequestSchema = z.object({
  url: z.string().min(1, "URL is required").refine(
    (val) => {
      try {
        const u = new URL(val.startsWith("http") ? val : `https://${val}`);
        return u.hostname.includes(".");
      } catch {
        return false;
      }
    },
    { message: "Invalid URL format" }
  ),
  provider: z.enum(["gemini", "groq", "deepseek", "claude", "gpt", "glm"]).optional(),
  language: z.string().min(2).max(5).default("en"),
});

export const analyzeRequestSchema = z.object({
  url: z.string().min(1, "URL is required").refine(
    (val) => {
      try {
        const u = new URL(val.startsWith("http") ? val : `https://${val}`);
        return u.hostname.includes(".");
      } catch {
        return false;
      }
    },
    { message: "Invalid URL format" }
  ),
  provider: z.enum(["gemini", "groq", "deepseek", "claude", "gpt", "glm"]),
  language: z.string().min(2).max(5).default("en"),
});

export const featureRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required").max(2000),
});