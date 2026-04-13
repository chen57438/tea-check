import type { FormState } from "../data/options";
import type { Report } from "./scoring";

export type AIAnalysis = {
  model: string;
  long_report: string;
  summary: string;
  pattern: string;
  psychology: string;
  implication: string;
  pressure_test: string;
};

export type AIInput = {
  form: FormState;
  report: Report;
  intakeMode: "structured" | "narrative";
};

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function buildAnalysisPrompt({ form, report, intakeMode }: AIInput) {
  return `
你是一个克制、专业、面向普通用户的关系分析助手。你只能根据提供的行为事实分析，不要把对方直接定性成“坏人”“绿茶”“操纵者”，除非证据非常直接。你的语言要专业、冷静、像咨询报告，不要鸡汤，不要夸张，不要道德审判。

请阅读以下结构化样本和规则引擎结果，并输出 JSON：
{
  "long_report": "一篇高质量中文长文分析。要求像专业咨询意见，不要标题套娃，不要碎片化短句。先给总体判断，再解释为什么不宜轻率定性，再提炼3-5个最关键的行为证据点，每个证据点都要展开解释其心理学含义，最后给出更专业的总结表达。全文至少6段，段落之间用\\n\\n分隔。",
  "summary": "2-4句整体判断",
  "pattern": "解释关系行为模式",
  "psychology": "解释可能的心理机制或动机，明确区分这是推测而不是定罪",
  "implication": "解释这对用户的现实含义",
  "pressure_test": "给出一段可以直接发送的压力测试消息，中文"
}

要求：
1. 全部用中文。
2. 明确区分“事实”“推测”“风险”。
3. 不要输出 markdown，不要加代码块，只输出合法 JSON。
4. 不要重复规则引擎原文，做更高质量、更自然的专业表达。
5. 字段 "long_report" 必须明显优于普通总结，风格参考专业心理分析，不要像模型模板回答。
6. 字段 "long_report" 里要尽量使用“更稳妥的判断是”“更谨慎的解释是”“这说明”“这还不能直接推出”这类克制表达。
7. 不要使用项目符号或编号列表，"long_report" 只输出自然段长文。

采集模式：${intakeMode}

用户输入：
${JSON.stringify(form, null, 2)}

规则引擎结果：
${JSON.stringify(
    {
      riskScore: report.riskScore,
      verdict: report.verdict,
      redFlags: report.redFlags,
      indicators: report.indicators,
      analysis: report.analysis,
    },
    null,
    2,
  )}
`.trim();
}

