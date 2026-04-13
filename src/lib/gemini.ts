import { AIInput, type AIAnalysis } from "./aiShared";

const MAX_RETRIES = 2;
const API_ENDPOINT = "/api/analyze";

export { type AIAnalysis } from "./aiShared";

export function hasGeminiKey() {
  return true;
}

export function getGeminiModel() {
  return import.meta.env.VITE_GEMINI_MODEL || "Cloudflare Pages Function";
}

async function generateViaProxy(input: AIInput): Promise<AIAnalysis> {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI 代理请求失败：${response.status} ${text}`);
  }

  return (await response.json()) as AIAnalysis;
}

export async function generateGeminiAnalysis(input: AIInput): Promise<AIAnalysis> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await generateViaProxy(input);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI 分析失败");

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => window.setTimeout(resolve, 600 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("AI 分析失败");
}
