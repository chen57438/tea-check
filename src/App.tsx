import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MetricCard } from "./components/MetricCard";
import { RadarChart } from "./components/RadarChart";
import { SectionCard } from "./components/SectionCard";
import {
  ageGapOptions,
  cultureOptions,
  curiosityOptions,
  defaultForm,
  depthOptions,
  distanceOptions,
  durationOptions,
  dynamicStageOptions,
  familyOptions,
  frictionTypeOptions,
  type FormState,
  originOptions,
  personalityOptions,
  reciprocityOptions,
  refusalStyleOptions,
  responseOptions,
  socialBackgroundOptions,
  statusOptions,
  stepLabels,
} from "./data/options";
import {
  generateGeminiAnalysis,
  getGeminiModel,
  hasGeminiKey,
  type AIAnalysis,
} from "./lib/gemini";
import { buildReport } from "./lib/scoring";

const stepMeta = [
  {
    eyebrow: "Phase 01",
    title: "基础画像",
    description: "先判断你们是不是从一开始就站在同一个人生坐标系里。",
  },
  {
    eyebrow: "Phase 02",
    title: "关系坐标",
    description: "认识路径、距离和当前定义，会直接决定关系的沟通成本。",
  },
  {
    eyebrow: "Phase 03",
    title: "互动模式",
    description: "这里不听解释，只看谁主动、谁承接、谁在关键时刻失踪。",
  },
  {
    eyebrow: "Phase 04",
    title: "关键事件",
    description: "任何关系都经得起开心，只有关键摩擦才能暴露真实优先级。",
  },
  {
    eyebrow: "Phase 05",
    title: "直觉校准",
    description: "最后一步不是问你爱不爱，而是判断你有没有开始自己骗自己。",
  },
];

const methodCards = [
  {
    title: "行为遥测",
    body: "把主动频率、响应波动、情绪互惠拆成可判读的关系信号，不再听单句好听话。",
  },
  {
    title: "事件验真",
    body: "关键节点最能暴露真实优先级。拒绝是否带 Plan B，比任何晚安都更值钱。",
  },
  {
    title: "认知去噪",
    body: "识别你是不是已经开始替对方编故事，把脑补从结论里剥离出去。",
  },
];

const productCards = [
  {
    title: "五阶段诊断问卷",
    body: "不是闲聊式测试，而是按背景、坐标、遥测、事件、直觉逐层取证。",
  },
  {
    title: "风险雷达报告",
    body: "把背景匹配、关系清晰、互惠质量、落地能力压缩成一张一眼能看的图。",
  },
  {
    title: "PM 式行动建议",
    body: "不给空泛安慰，只给下一步怎么做、怎么验证、怎么止损。",
  },
];

const AI_CACHE_PREFIX = "teacheck-ai-analysis";

function hashText(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16);
}

function ComboField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  const manualValue = "__manual__";
  const matchedOption = options.find((option) => option.value === value);
  const isManual = !matchedOption;

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <select
        value={isManual ? manualValue : value}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (nextValue === manualValue) {
            onChange("");
            return;
          }
          onChange(nextValue);
        }}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan/70"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value={manualValue}>手动输入</option>
      </select>

      {isManual ? (
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          className="w-full rounded-2xl border border-cyan/30 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan/70"
          placeholder="请输入自定义内容"
        />
      ) : null}

      {isManual ? (
        <button
          type="button"
          onClick={() => onChange(options[0]?.value ?? "")}
          className="text-left text-xs text-slate-400 transition hover:text-slate-200"
        >
          返回建议选项
        </button>
      ) : null}
    </label>
  );
}

function RangeField({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="font-display text-lg text-cyan">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-track h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
      />
      <div className="flex justify-between text-[11px] uppercase tracking-[0.28em] text-slate-500">
        <span>对方主导</span>
        <span>我主导</span>
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  rows = 5,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan/70"
      />
    </label>
  );
}

function NavButton({
  children,
  to,
}: {
  children: string;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm transition ${
          isActive ? "bg-cyan/12 text-cyan" : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [step, setStep] = useState(0);
  const [intakeMode, setIntakeMode] = useState<"structured" | "narrative">("structured");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const report = useMemo(() => buildReport(form, intakeMode), [form, intakeMode]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const currentInsight = report.stageInsights[step];
  const progress = ((step + 1) / stepLabels.length) * 100;
  const reportMode = searchParams.get("mode");
  const canViewReport = reportMode === "live" || reportMode === "demo";
  const isDemoReport = reportMode === "demo";
  const aiEnabled = hasGeminiKey();
  const aiModel = getGeminiModel();
  const aiCacheKey = useMemo(() => {
    const signature = JSON.stringify({
      intakeMode,
      reportMode,
      form,
      riskScore: report.riskScore,
      verdictLabel: report.verdictLabel,
    });

    return `${AI_CACHE_PREFIX}:${hashText(signature)}`;
  }, [form, intakeMode, report.riskScore, report.verdictLabel, reportMode]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const startAssessment = () => {
    setStep(0);
    navigate("/diagnosis");
  };

  const openReport = () => {
    navigate("/report?mode=live");
  };

  const openDemoReport = () => {
    navigate("/report?mode=demo");
  };

  const restart = () => {
    setForm(defaultForm);
    setStep(0);
    setIntakeMode("structured");
    setAiAnalysis(null);
    setAiError(null);
    navigate("/diagnosis");
  };

  useEffect(() => {
    if (location.pathname !== "/report" || !canViewReport) {
      return;
    }

    if (!aiEnabled) {
      setAiAnalysis(null);
      setAiError("AI 服务当前不可用，已回退到规则引擎报告。");
      return;
    }

    const cachedResult = window.sessionStorage.getItem(aiCacheKey);

    if (cachedResult) {
      try {
        setAiAnalysis(JSON.parse(cachedResult) as AIAnalysis);
        setAiError(null);
        setAiLoading(false);
        return;
      } catch {
        window.sessionStorage.removeItem(aiCacheKey);
      }
    }

    let cancelled = false;

    async function run() {
      try {
        setAiLoading(true);
        setAiError(null);
        const result = await generateGeminiAnalysis({
          form,
          report,
          intakeMode,
        });

        if (!cancelled) {
          setAiAnalysis(result);
          window.sessionStorage.setItem(aiCacheKey, JSON.stringify(result));
        }
      } catch (error) {
        if (!cancelled) {
          setAiAnalysis(null);
          setAiError(error instanceof Error ? error.message : "AI 分析失败");
        }
      } finally {
        if (!cancelled) {
          setAiLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, canViewReport, aiEnabled, aiCacheKey, form, intakeMode, report]);

  const narrativeSections = [
    {
      title: "1. 基础画像（背景对齐）",
      lines: [
        "年龄与生活阶段：双方的年龄差，以及目前所处的具体阶段，比如学业冲刺期、职场转型期或稳定期。",
        "社会背景：教育背景、文化环境、留学生背景或原生家庭氛围，它们会影响沟通逻辑和价值排序。",
        "性格标签：她的内向/外向、感性/理性，以及社交场合与私下相处的反差。",
      ],
    },
    {
      title: "2. 关系坐标（进度与定性）",
      lines: [
        "认识契机与时长：校园、社交软件、职场还是朋友介绍？现在认识了多久？",
        "当前定义：初识暧昧、朋友以上、反复拉锯，还是曾经裂开后处于修复期？",
        "物理距离：同城还是异地，这会直接影响安全感和沟通频率。",
      ],
    },
    {
      title: "3. 互动模式（核心数据）",
      lines: [
        "沟通频率与主动性：谁发起更多？回复速度是秒回、轮回，还是有规律的回应？",
        "内容深度：停留在日常报备，还是能触及人生观、压力、脆弱点等深层话题？",
        "互动反馈：她是否主动提供情绪价值，还是主要作为信息接收者？",
      ],
    },
    {
      title: "4. 关键事件（异常波动的节点）",
      lines: [
        "正向里程碑：有没有哪个时刻让你觉得两人关系有了质的突破？",
        "负向摩擦/冷处理：最近是否有具体矛盾或明显态度转变？",
        "尽量写事实而不是结论，例如：周五我约她时，她以 XX 理由拒绝，且没有提供 Plan B。",
      ],
    },
    {
      title: "5. 你的直觉与偏差（校准过滤器）",
      lines: [
        "你的核心诉求：你希望这段关系长久发展、继续观察，还是只是想解开某个疑虑？",
        "你的困惑点：最让你看不透、或最让你不适的特定行为是什么？",
      ],
    },
  ];

  const renderStepFields = () => {
    if (intakeMode === "narrative") {
      return (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan/70">Narrative Guide</p>
            <div className="mt-3 grid gap-5">
              {narrativeSections.map((section) => (
                <div key={section.title} className="grid gap-2">
                  <h3 className="font-display text-xl text-white">{section.title}</h3>
                  {section.lines.map((line) => (
                    <p key={line} className="text-sm leading-6 text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <TextAreaField
            label="自由叙述输入"
            value={form.narrativeText}
            placeholder="把整段关系按上面的提示一次性写下来。你不需要逐格填表，尽量用具体事实，不要只写“她突然冷淡了”这种结论。"
            rows={22}
            onChange={(value) => updateField("narrativeText", value)}
          />
        </div>
      );
    }

    if (step === 0) {
      return (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ComboField
              label="生活阶段与推进节奏"
              value={form.dynamicStage}
              options={dynamicStageOptions}
              onChange={(value) => updateField("dynamicStage", value)}
            />
            <ComboField
              label="年龄差与阶段感"
              value={form.ageGap}
              options={ageGapOptions}
              onChange={(value) => updateField("ageGap", value)}
            />
            <ComboField
              label="社会背景与资源位"
              value={form.socialBackground}
              options={socialBackgroundOptions}
              onChange={(value) => updateField("socialBackground", value)}
            />
            <ComboField
              label="文化氛围"
              value={form.cultureAtmosphere}
              options={cultureOptions}
              onChange={(value) => updateField("cultureAtmosphere", value)}
            />
            <ComboField
              label="原生家庭态度"
              value={form.familyAttitude}
              options={familyOptions}
              onChange={(value) => updateField("familyAttitude", value)}
            />
            <ComboField
              label="你观察到的性格模式"
              value={form.personalityRead}
              options={personalityOptions}
              onChange={(value) => updateField("personalityRead", value)}
            />
          </div>
          <TextAreaField
            label="基础画像补充观察"
            value={form.profileNotes}
            placeholder=""
            rows={4}
            onChange={(value) => updateField("profileNotes", value)}
          />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ComboField
              label="认识时长"
              value={form.howLongKnown}
              options={durationOptions}
              onChange={(value) => updateField("howLongKnown", value)}
            />
            <ComboField
              label="认识契机"
              value={form.connectionOrigin}
              options={originOptions}
              onChange={(value) => updateField("connectionOrigin", value)}
            />
            <ComboField
              label="物理距离"
              value={form.distanceMode}
              options={distanceOptions}
              onChange={(value) => updateField("distanceMode", value)}
            />
            <ComboField
              label="当前关系定义"
              value={form.relationshipState}
              options={statusOptions}
              onChange={(value) => updateField("relationshipState", value)}
            />
          </div>
          <TextAreaField
            label="关系坐标补充说明"
            value={form.relationshipNotes}
            placeholder=""
            rows={4}
            onChange={(value) => updateField("relationshipNotes", value)}
          />
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="grid gap-5">
          <RangeField
            label="主动性滑块：当前更多是谁发起对话？"
            value={form.initiativeBalance}
            onChange={(value) => updateField("initiativeBalance", value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ComboField
              label="响应一致性"
              value={form.responseConsistency}
              options={responseOptions}
              onChange={(value) => updateField("responseConsistency", value)}
            />
            <ComboField
              label="内容深度分级"
              value={form.conversationDepth}
              options={depthOptions}
              onChange={(value) => updateField("conversationDepth", value)}
            />
            <ComboField
              label="互惠性检查"
              value={form.reciprocity}
              options={reciprocityOptions}
              onChange={(value) => updateField("reciprocity", value)}
            />
            <ComboField
              label="主动询问频率"
              value={form.activeCuriosity}
              options={curiosityOptions}
              onChange={(value) => updateField("activeCuriosity", value)}
            />
          </div>
          <TextAreaField
            label="互动模式补充样本"
            value={form.interactionNotes}
            placeholder="例如：她会在周末深夜突然找我，但白天像消失；大多时候只聊她自己的情绪；一到我说需求就转移话题。"
            rows={4}
            onChange={(value) => updateField("interactionNotes", value)}
          />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="grid gap-4">
          <TextAreaField
            label="最近一次负向摩擦细节"
            value={form.frictionStory}
            placeholder="例如：约见面被拒、临时放鸽子、答应的事没兑现，对方是怎么说、怎么做的。"
            onChange={(value) => updateField("frictionStory", value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ComboField
              label="摩擦类型"
              value={form.frictionType}
              options={frictionTypeOptions}
              onChange={(value) => updateField("frictionType", value)}
            />
            {form.frictionType === "dateRefusal" ? (
              <ComboField
                label="如果这次摩擦是拒绝见面：对方是否给过替代时间或替代方案"
                value={form.refusalStyle}
                options={refusalStyleOptions}
                onChange={(value) => updateField("refusalStyle", value)}
              />
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-400">
                只有当摩擦类型是“拒绝见面 / 临时放鸽子”时，系统才会追问 Plan B。这一项不再默认强行放在所有事件里。
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <TextAreaField
          label="你现在最困惑的点"
          value={form.confusionPoint}
          placeholder="把你最反复纠结、最容易脑补的那句话写出来。"
          onChange={(value) => updateField("confusionPoint", value)}
        />
        <TextAreaField
          label="你的核心诉求"
          value={form.coreNeed}
          placeholder="你真正需要的，是明确关系、稳定推进，还是体面的退出？"
          onChange={(value) => updateField("coreNeed", value)}
        />
      </div>
    );
  };

  const landingView = (
    <>
      <section className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-glow backdrop-blur xl:px-8 xl:py-10">
        <div className="grid gap-10 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan/80">TeaCheck AI / Relational Diagnostics</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight text-white md:text-6xl">
              不是所有暧昧都值得分析，但所有反复内耗都值得验尸。
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300">
              TeaCheck AI 把心理学、博弈论和行为信号拆成一套网站式诊断流程。你输入事实，
              系统输出证据、风险等级和下一步动作，不再让模糊关系吞掉判断力。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={startAssessment}
                className="rounded-full border border-cyan/40 bg-cyan/10 px-6 py-3 text-sm font-medium text-cyan transition hover:bg-cyan/15"
              >
                开始诊断
              </button>
              <button
                type="button"
                onClick={openDemoReport}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20"
              >
                查看示例报告
              </button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[30px] border border-cyan/20 bg-slate-950/60 p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live Preview</p>
                <p className="mt-3 font-display text-5xl text-white">{report.riskScore}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Verdict</p>
                <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-100">{report.verdictLabel}</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan via-amber to-rose"
                style={{ width: `${report.riskScore}%` }}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {report.redFlags.slice(0, 4).map((flag) => (
                <div
                  key={flag}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200"
                >
                  {flag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        {productCards.map((item) => (
          <article
            key={item.title}
            className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-cyan/70">Capability</p>
            <h2 className="mt-4 font-display text-2xl text-white">{item.title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          eyebrow="Method"
          title="方法论"
          description="先抽样，再判别，再给动作。整个网站只做一件事：让你重新回到事实。"
        >
          <div className="grid gap-4">
            {methodCards.map((item, index) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">0{index + 1}</p>
                <h3 className="mt-2 font-display text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Sample Output"
          title="示例雷达"
          description="真正危险的关系，通常吸引力还在，清晰、互惠和落地却已经塌掉。"
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <RadarChart data={report.radar} />
            <div className="grid gap-3">
              {report.radar.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className="font-display text-2xl text-white">{item.value}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan to-mint"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="mt-8 rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-glow backdrop-blur xl:px-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-cyan/70">Ready To Audit</p>
            <h2 className="mt-4 font-display text-3xl text-white">如果你已经开始反复替对方找理由，就别再拖。</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              先把样本喂给系统，再决定是继续投入、启动压力测试，还是直接退出。模糊关系最擅长偷走时间。
            </p>
          </div>
          <button
            type="button"
            onClick={startAssessment}
            className="rounded-full border border-cyan/40 bg-cyan/10 px-6 py-3 text-sm font-medium text-cyan transition hover:bg-cyan/15"
          >
            进入完整诊断
          </button>
        </div>
      </section>
    </>
  );

  const assessmentView = (
    <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-8">
        <SectionCard
          eyebrow={stepMeta[step].eyebrow}
          title={stepMeta[step].title}
          description={stepMeta[step].description}
        >
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIntakeMode("structured")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                intakeMode === "structured"
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-white/10 text-slate-300 hover:border-white/20"
              }`}
            >
              结构化采集
            </button>
            <button
              type="button"
              onClick={() => setIntakeMode("narrative")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                intakeMode === "narrative"
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-white/10 text-slate-300 hover:border-white/20"
              }`}
            >
              自由叙述模式
            </button>
          </div>

          <div className="mb-6 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">诊断进度</p>
                <p className="mt-2 text-sm text-slate-200">
                  已完成 {step + 1} / {stepLabels.length} 个维度
                </p>
              </div>
              <p className="font-display text-3xl text-white">{Math.round(progress)}%</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-mint transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {intakeMode === "structured"
                ? "结构化模式适合快速判别和稳定出分。"
                : "自由叙述模式适合你不想被表单切碎，而是想直接按事实完整描述。"}
            </p>
          </div>

          {intakeMode === "structured" ? (
            <div className="mb-6 grid gap-3 md:grid-cols-5">
              {stepLabels.map((label, index) => {
                const active = index === step;
                const passed = index < step;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(index)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-cyan/60 bg-cyan/10"
                        : passed
                          ? "border-white/15 bg-white/10"
                          : "border-white/10 bg-slate-950/60"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">0{index + 1}</p>
                    <p className="mt-2 text-sm font-medium text-white">{label}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {renderStepFields()}

          {intakeMode === "structured" ? (
            <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-xl rounded-3xl border border-cyan/20 bg-cyan/10 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">阶段性洞察提示</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">{currentInsight.insight}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20"
                >
                  上一步
                </button>
                {step < stepLabels.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.min(stepLabels.length - 1, current + 1))}
                    className="rounded-2xl border border-cyan/40 bg-cyan/10 px-4 py-3 text-sm text-cyan transition hover:bg-cyan/15"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openReport}
                    className="rounded-2xl border border-cyan/40 bg-cyan/10 px-4 py-3 text-sm text-cyan transition hover:bg-cyan/15"
                  >
                    生成完整报告
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={openReport}
                className="rounded-2xl border border-cyan/40 bg-cyan/10 px-4 py-3 text-sm text-cyan transition hover:bg-cyan/15"
              >
                生成完整报告
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="PM Actions"
          title="当前行动预案"
          description="系统已经基于现有样本给出下一步动作。样本越完整，建议越锋利。"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {report.action.map((item, index) => (
              <article
                key={item}
                className={`rounded-3xl border p-5 ${
                  index === 0
                    ? "border-rose/20 bg-rose/10"
                    : index === 1
                      ? "border-cyan/20 bg-cyan/10"
                      : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Action 0{index + 1}</p>
                <p className="mt-3 text-sm leading-6 text-slate-100">{item}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-8">
        <SectionCard
          eyebrow="Live Engine"
          title="实时风险读数"
          description="每填完一个维度，系统都会重新计算风险，不让你等到最后才发现问题已经很明显。"
        >
          <div className="rounded-[28px] border border-cyan/20 bg-slate-950/60 p-5">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">综合判定</p>
                <p className="mt-2 font-display text-3xl text-white">{report.verdictLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">风险值</p>
                <p className="mt-2 font-display text-5xl text-white">{report.riskScore}</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan via-amber to-rose transition-all duration-500"
                style={{ width: `${report.riskScore}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-200">{report.verdict}</p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Logic Engine"
          title="四项诊断模型"
          description="这里展示的不是情绪评价，而是规则引擎对行为证据做出的结构化判断。"
        >
          <div className="grid gap-4">
            {report.indicators.map((indicator) => (
              <MetricCard key={indicator.label} {...indicator} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Psychological Reading"
          title="专业解读"
          description="这部分不急着贴标签，而是解释这段关系为什么会让人困惑、上头或持续内耗。"
        >
          {aiLoading ? (
            <div className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5 text-sm leading-7 text-slate-100">
              正在生成 AI 深度解读...
            </div>
          ) : aiAnalysis ? (
            <div className="grid gap-4">
              <article className="rounded-3xl border border-cyan/20 bg-slate-950/70 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">AI Full Analysis</p>
                <div className="mt-4 whitespace-pre-line text-[15px] leading-8 text-slate-100">
                  {aiAnalysis.long_report}
                </div>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.summary}</p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Pattern</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.pattern}</p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Psychology</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.psychology}</p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current Model</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{aiModel}</p>
              </article>
            </div>
          ) : (
            <div className="grid gap-4">
              <article className="rounded-3xl border border-amber/20 bg-amber/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-100">AI Unavailable</p>
                <p className="mt-3 text-sm leading-7 text-slate-100">
                  {aiError ?? "当前没有可用的 AI 深度解读，已回退到规则引擎分析。"}
                </p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pattern</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{report.analysis.pattern}</p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Psychology</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{report.analysis.psychology}</p>
              </article>
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Pressure Test"
          title={report.pressureTest.title}
          description="如果你不想再靠猜，最有效的办法不是继续解释，而是让对方回应一个清晰、有限、需要表态的问题。"
        >
          <div className="grid gap-4">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Message Draft</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                {aiAnalysis?.pressure_test ?? report.pressureTest.message}
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Why It Works</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{report.pressureTest.whyItWorks}</p>
            </article>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Fact Replay"
          title="当前红旗"
          description="你可以把这里当成关系异常日志。越反复出现的，越不该继续合理化。"
        >
          <div className="grid gap-3">
            {report.redFlags.length > 0 ? (
              report.redFlags.map((flag) => (
                <div
                  key={flag}
                  className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-4 text-sm leading-6 text-slate-100"
                >
                  {flag}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-4 text-sm leading-6 text-slate-100">
                暂未抓到强红旗，但这不代表安全，只代表还需要更多事实样本。
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const reportView = (
    <div className="space-y-8">
      {canViewReport ? (
        <>
          <section className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-glow backdrop-blur xl:px-8">
            <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-cyan/80">
                  {isDemoReport ? "Sample Report" : "Final Report"}
                </p>
                <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight text-white md:text-5xl">
                  {report.verdictLabel}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{report.verdict}</p>
              </div>
              <div className="rounded-[28px] border border-cyan/20 bg-slate-950/60 p-5">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">操纵风险值</p>
                    <p className="mt-2 font-display text-6xl text-white">{report.riskScore}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Recommendation</p>
                    <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-100">{report.action[0]}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan via-amber to-rose"
                    style={{ width: `${report.riskScore}%` }}
                  />
                </div>
                {isDemoReport ? (
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    这是演示样本报告，用来展示结构，不代表你的真实诊断结果。
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-8">
              <SectionCard
                eyebrow="Radar"
                title="关系平衡雷达"
                description="真正健康的关系，不会只剩吸引力；它至少还要有清晰、互惠和落地。"
              >
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <RadarChart data={report.radar} />
                  <div className="grid gap-3">
                    {report.radar.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{item.label}</span>
                          <span className="font-display text-2xl text-white">{item.value}</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan to-mint"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Action Plan"
                title="下阶段操作建议"
                description="不要同时做十件事，只做三件最能验证关系真相的动作。"
              >
                <div className="grid gap-4">
                  {report.action.map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-3xl border p-5 ${
                        index === 0
                          ? "border-rose/20 bg-rose/10"
                          : index === 1
                            ? "border-cyan/20 bg-cyan/10"
                            : "border-white/10 bg-white/5"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step 0{index + 1}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-100">{item}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="space-y-8">
          <SectionCard
            eyebrow="Diagnostics"
            title="四项逻辑结论"
            description="每一项都是行为证据的压缩结论，不是情绪臆测。"
          >
                <div className="grid gap-4">
                  {report.indicators.map((indicator) => (
                    <MetricCard key={indicator.label} {...indicator} />
                  ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Psychological Reading"
            title="心理学解读"
            description="这里解释的不是对方“是什么人”，而是这段互动在心理机制上像什么。"
          >
            {aiLoading ? (
              <div className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5 text-sm leading-7 text-slate-100">
                正在调用 AI 生成深度报告...
              </div>
            ) : aiAnalysis ? (
              <div className="grid gap-4">
                <article className="rounded-3xl border border-cyan/20 bg-slate-950/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">完整心理分析</p>
                  <div className="mt-4 whitespace-pre-line text-[15px] leading-8 text-slate-100">
                    {aiAnalysis.long_report}
                  </div>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI 总结</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.summary}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">行为模式</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.pattern}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">可能心理机制</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.psychology}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">对你的现实含义</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{aiAnalysis.implication}</p>
                </article>
                <article className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">客观性说明</p>
                  <p className="mt-3 text-sm leading-7 text-slate-100">{report.analysis.objectivity}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">当前模型</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{aiModel}</p>
                </article>
              </div>
            ) : (
              <div className="grid gap-4">
                <article className="rounded-3xl border border-amber/20 bg-amber/10 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100">AI Unavailable</p>
                  <p className="mt-3 text-sm leading-7 text-slate-100">
                    {aiError ?? "AI 深度分析暂不可用，当前显示规则引擎解读。"}
                  </p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">行为模式</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{report.analysis.pattern}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">可能心理动机</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{report.analysis.psychology}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">对你的现实含义</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{report.analysis.implication}</p>
                </article>
                <article className="rounded-3xl border border-cyan/20 bg-cyan/10 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">客观性说明</p>
                  <p className="mt-3 text-sm leading-7 text-slate-100">{report.analysis.objectivity}</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">结论可靠性</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{report.analysis.confidence}</p>
                </article>
              </div>
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Pressure Test"
            title={report.pressureTest.title}
            description="这不是情绪宣泄，而是一个用来验证关系真实方向的消息模板。"
          >
            <div className="grid gap-4">
              <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">可直接发送</p>
                <p className="mt-3 text-sm leading-7 text-slate-100">
                  {aiAnalysis?.pressure_test ?? report.pressureTest.message}
                </p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">设计逻辑</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{report.pressureTest.whyItWorks}</p>
              </article>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Red Flags"
            title="事实复盘"
                description="这里列出的不是你“觉得怪”的点，而是系统已经判定有问题的行为模式。"
              >
                <div className="grid gap-3">
                  {report.redFlags.length > 0 ? (
                    report.redFlags.map((flag) => (
                      <div
                        key={flag}
                        className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-4 text-sm leading-6 text-slate-100"
                      >
                        {flag}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-4 text-sm leading-6 text-slate-100">
                      暂未抓到强红旗，但这不代表安全，只代表还需要更多事实样本。
                    </div>
                  )}
                </div>
                <div className="mt-5 grid gap-3">
                  {report.notes.map((note) => (
                    <div
                      key={note}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-slate-300"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Methodology"
                title="分析方法说明"
                description="把产品能力边界讲清楚，比装作什么都懂更重要。"
              >
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm leading-7 text-slate-200">
                    {report.methodology}
                    {aiEnabled
                      ? " 当前已检测到可用 API key，报告页会自动触发 Gemini 深度分析，规则引擎只作为兜底。"
                      : " 当前尚未检测到 API key，所以网站仍只能使用规则引擎结果。"}
                  </p>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      ) : (
        <section className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-10 shadow-glow backdrop-blur xl:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.36em] text-cyan/80">Report Access Guard</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-white md:text-5xl">
              这里不直接展示默认报告。
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-300">
              报告页只对两种入口开放：一是你完成诊断后生成的真实报告，二是你主动点开的演示样本。
              直接访问 `/report` 不会再把默认样本伪装成你的结果。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={startAssessment}
                className="rounded-full border border-cyan/40 bg-cyan/10 px-6 py-3 text-sm font-medium text-cyan transition hover:bg-cyan/15"
              >
                去做完整诊断
              </button>
              <button
                type="button"
                onClick={openDemoReport}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20"
              >
                查看演示报告
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.14),_transparent_30%),linear-gradient(180deg,_rgba(7,17,31,0.98),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 -z-10 bg-grid bg-[length:44px_44px] opacity-20" />

      <div className="mx-auto flex max-w-[1520px] flex-col px-4 py-8 lg:px-8 xl:px-10">
        <header className="mb-8 flex flex-col gap-5 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl text-white">TeaCheck AI</p>
            <p className="text-sm text-slate-400">Behavior-Driven Relationship Diagnostics</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavButton to="/">首页</NavButton>
            <NavButton to="/diagnosis">诊断流程</NavButton>
            <NavButton to="/report">报告视图</NavButton>
          </nav>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={startAssessment}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20"
            >
              开始诊断
            </button>
            <button
              type="button"
              onClick={restart}
              className="rounded-full border border-cyan/40 bg-cyan/10 px-4 py-2 text-sm text-cyan transition hover:bg-cyan/15"
            >
              重置样本
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={landingView} />
          <Route path="/diagnosis" element={assessmentView} />
          <Route path="/report" element={reportView} />
        </Routes>
      </div>
    </main>
  );
}
