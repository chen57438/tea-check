import { buildAnalysisPrompt, DEFAULT_GEMINI_MODEL, type AIAnalysis, type AIInput } from "../../src/lib/aiShared";

type Env = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

export async function onRequestPost(context: PagesContext) {
  const apiKey = context.env.GEMINI_API_KEY;
  const model = context.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    return json({ error: "Cloudflare 未配置 GEMINI_API_KEY secret" }, { status: 500 });
  }

  let payload: AIInput;

  try {
    payload = (await context.request.json()) as AIInput;
  } catch {
    return json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const prompt = buildAnalysisPrompt(payload);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    return json({ error: `Gemini 请求失败：${response.status} ${text}` }, { status: 502 });
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return json({ error: "Gemini 未返回可解析文本" }, { status: 502 });
  }

  let analysis: Omit<AIAnalysis, "model">;

  try {
    analysis = JSON.parse(text) as Omit<AIAnalysis, "model">;
  } catch {
    return json({ error: "Gemini 返回的 JSON 无法解析" }, { status: 502 });
  }

  return json({
    model,
    ...analysis,
  } satisfies AIAnalysis);
}
