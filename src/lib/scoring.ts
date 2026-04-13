import type { FormState } from "../data/options";

type Tone = "danger" | "warn" | "safe";

type Metric = {
  label: string;
  score: number;
  tone: Tone;
  summary: string;
};

type StageInsight = {
  stage: number;
  title: string;
  insight: string;
};

export type Report = {
  riskScore: number;
  verdict: string;
  verdictLabel: string;
  indicators: Metric[];
  radar: { label: string; value: number }[];
  stageInsights: StageInsight[];
  redFlags: string[];
  action: string[];
  notes: string[];
  analysis: {
    pattern: string;
    psychology: string;
    implication: string;
    objectivity: string;
    confidence: string;
  };
  pressureTest: {
    title: string;
    message: string;
    whyItWorks: string;
  };
  methodology: string;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const includesAny = (text: string, keywords: string[]) => keywords.some((item) => text.includes(item));
const riskOf = (map: Record<string, number>, key: string, fallback = 50) => map[key] ?? fallback;

export function buildReport(form: FormState, intakeMode: "structured" | "narrative" = "structured"): Report {
  const frictionText = form.frictionStory.trim().toLowerCase();
  const confusionText = form.confusionPoint.trim();
  const needText = form.coreNeed.trim();
  const profileNotes = form.profileNotes.trim().toLowerCase();
  const relationshipNotes = form.relationshipNotes.trim().toLowerCase();
  const interactionNotes = form.interactionNotes.trim().toLowerCase();
  const narrativeBlob = form.narrativeText.trim().toLowerCase();

  const stageRiskMap: Record<string, number> = {
    alignedSprint: 12,
    userWorkPartnerStudy: 45,
    userStudyPartnerWork: 62,
    mismatched: 76,
    timingMismatch: 70,
    busyButAligned: 20,
  };

  const ageRiskMap: Record<string, number> = {
    close: 10,
    medium: 28,
    large: 54,
    maturityGap: 48,
  };

  const backgroundRiskMap: Record<string, number> = {
    aligned: 12,
    userStronger: 32,
    partnerStronger: 58,
    misaligned: 74,
    lifestyleGap: 68,
  };

  const cultureRiskMap: Record<string, number> = {
    compatible: 10,
    globalized: 34,
    reserved: 42,
    conflicted: 68,
    mixedSignals: 52,
    socialStyleGap: 46,
  };

  const familyRiskMap: Record<string, number> = {
    open: 8,
    moderate: 26,
    strong: 56,
    excuse: 72,
    shield: 78,
  };

  const personalityRiskMap: Record<string, number> = {
    consistentWarm: 10,
    publicHotPrivateCold: 72,
    charmingAvoidant: 82,
    probing: 76,
    softButEscaping: 74,
    universallyWarm: 58,
    privateNeedPublicDistance: 86,
  };

  const durationRiskMap: Record<string, number> = {
    new: 18,
    warming: 24,
    testing: 42,
    dragging: 78,
    onOffLongTerm: 84,
  };

  const originRiskMap: Record<string, number> = {
    offline: 14,
    datingApp: 54,
    hybrid: 34,
    institutional: 22,
    reconnected: 48,
    community: 28,
  };

  const distanceRiskMap: Record<string, number> = {
    sameCity: 10,
    regional: 36,
    longDistance: 68,
    emotionallyFar: 76,
    sameCityNoMeet: 82,
    scheduleConflict: 58,
  };

  const statusRiskMap: Record<string, number> = {
    early: 15,
    situationship: 56,
    undefinedExclusive: 72,
    stalled: 80,
    intimateButUndefined: 84,
    verbalIntentOnly: 70,
  };

  const responseRiskMap: Record<string, number> = {
    stable: 12,
    hotColdCycle: 72,
    vanishAfterHeat: 92,
    utilityDriven: 82,
    weekendOnly: 76,
    politeButStatic: 54,
  };

  const depthRiskMap: Record<string, number> = {
    light: 18,
    reporting: 36,
    deep: 42,
    deepButCheap: 86,
    futureTalkNoPlan: 74,
    selfCentricDepth: 82,
  };

  const reciprocityRiskMap: Record<string, number> = {
    mutual: 10,
    userCarries: 58,
    partnerDumps: 88,
    empty: 50,
    verbalOnlySupport: 64,
    deflecting: 78,
  };

  const curiosityRiskMap: Record<string, number> = {
    high: 8,
    medium: 32,
    low: 74,
    none: 96,
    reactive: 62,
  };

  const frictionRiskMap: Record<string, number> = {
    dateRefusal: 58,
    disappear: 82,
    boundary: 76,
    futureFake: 72,
  };

  const refusalRiskMap: Record<string, number> = {
    withPlanB: 8,
    softPlanB: 42,
    withoutPlanB: 88,
    dismissive: 96,
  };

  const profileTension = clamp(
    riskOf(stageRiskMap, form.dynamicStage) * 0.25 +
      riskOf(ageRiskMap, form.ageGap) * 0.15 +
      riskOf(backgroundRiskMap, form.socialBackground) * 0.25 +
      riskOf(cultureRiskMap, form.cultureAtmosphere) * 0.15 +
      riskOf(familyRiskMap, form.familyAttitude) * 0.2 +
      riskOf(personalityRiskMap, form.personalityRead) * 0.25 +
      (includesAny(profileNotes, ["冷淡", "暧昧", "忽冷忽热", "边界", "失联"]) ? 8 : 0),
  );

  const relationshipFriction = clamp(
    riskOf(durationRiskMap, form.howLongKnown) * 0.28 +
      riskOf(originRiskMap, form.connectionOrigin) * 0.18 +
      riskOf(distanceRiskMap, form.distanceMode) * 0.26 +
      riskOf(statusRiskMap, form.relationshipState) * 0.28 +
      (includesAny(relationshipNotes, ["不上不下", "卡住", "异地", "见不到", "没定义"]) ? 8 : 0),
  );

  const initiativeRisk = clamp((form.initiativeBalance - 50) * 1.8, 0, 100);
  const telemetryRisk = clamp(
    initiativeRisk * 0.22 +
      riskOf(responseRiskMap, form.responseConsistency) * 0.28 +
      riskOf(depthRiskMap, form.conversationDepth) * 0.2 +
      riskOf(reciprocityRiskMap, form.reciprocity) * 0.18 +
      riskOf(curiosityRiskMap, form.activeCuriosity) * 0.22 +
      (includesAny(interactionNotes, ["只聊自己", "不问我", "深夜", "失踪", "轮回"]) ? 10 : 0),
  );

  const keywordPlanBDetected = includesAny(frictionText, [
    "改天",
    "下次",
    "另一天",
    "换个时间",
    "周末",
    "再约",
    "another time",
    "next week",
  ]);

  const refusalPenalty =
    form.refusalStyle === "withPlanB"
      ? 0
      : form.refusalStyle === "softPlanB"
        ? 15
        : form.refusalStyle === "withoutPlanB"
          ? 28
          : 34;

  const planBGap =
    form.frictionType === "dateRefusal" && !keywordPlanBDetected && form.refusalStyle !== "withPlanB"
      ? 18
      : 0;

  const eventRisk = clamp(
    frictionRiskMap[form.frictionType] * 0.5 + refusalRiskMap[form.refusalStyle] * 0.5 + refusalPenalty + planBGap,
  );

  const narrativeProfileRisk =
    (includesAny(narrativeBlob, ["学生", "职场", "年龄差", "留学", "家庭", "反差"]) ? 26 : 0) +
    (includesAny(narrativeBlob, ["冷淡", "忽冷忽热", "抽离", "不表态"]) ? 22 : 0);

  const narrativeRelationshipRisk =
    (includesAny(narrativeBlob, ["社交软件", "异地", "拉扯", "没定义", "同城约不出来"]) ? 34 : 0) +
    (includesAny(narrativeBlob, ["暧昧", "修复期", "裂痕", "不上不下"]) ? 22 : 0);

  const narrativeInteractionRisk =
    (includesAny(narrativeBlob, ["忽冷忽热", "秒回", "轮回", "消失", "失联"]) ? 42 : 0) +
    (includesAny(narrativeBlob, ["只聊自己", "不问我", "情绪价值", "深夜", "边界"]) ? 34 : 0);

  const narrativeEventRisk =
    (includesAny(narrativeBlob, ["拒绝", "放鸽子", "改天", "plan b", "替代方案"]) ? 28 : 0) +
    (includesAny(narrativeBlob, ["没有替代方案", "没有plan b", "冷处理", "画饼", "边界不清"]) ? 38 : 0);

  const narrativeIntuitionRisk =
    (includesAny(narrativeBlob, ["脑补", "找理由", "想多了", "不适", "看不透"]) ? 42 : 0) +
    (includesAny(narrativeBlob, ["长久发展", "观察", "疑虑", "核心诉求"]) ? 18 : 0);

  const narrativeComposite = clamp(
    narrativeProfileRisk * 0.16 +
      narrativeRelationshipRisk * 0.18 +
      narrativeInteractionRisk * 0.32 +
      narrativeEventRisk * 0.22 +
      narrativeIntuitionRisk * 0.12,
  );

  const selfFantasyKeywords = ["是不是我想多了", "给她找理由", "再等等", "也许只是", "试探我", "我不断想"];
  const validationNeedKeywords = ["确认", "稳定", "明确", "尊重", "投入", "关系"];

  const selfFantasyRisk = includesAny(confusionText, selfFantasyKeywords) ? 78 : 38;
  const coreNeedClarity = includesAny(needText, validationNeedKeywords) ? 24 : 56;
  const intuitionRisk = clamp(selfFantasyRisk * 0.58 + coreNeedClarity * 0.42);

  const emotionalContainer =
    (form.conversationDepth === "deep" || form.conversationDepth === "deepButCheap") &&
    (form.reciprocity === "partnerDumps" || form.reciprocity === "userCarries" || form.reciprocity === "deflecting") &&
    (form.activeCuriosity === "low" || form.activeCuriosity === "none" || form.activeCuriosity === "reactive");

  const intermittentReinforcement =
    form.responseConsistency === "hotColdCycle" ||
    form.responseConsistency === "vanishAfterHeat" ||
    form.responseConsistency === "weekendOnly";

  const capitalInvestmentImbalance =
    (form.socialBackground === "partnerStronger" || form.socialBackground === "misaligned") &&
    (form.reciprocity === "partnerDumps" || form.reciprocity === "userCarries" || form.reciprocity === "verbalOnlySupport") &&
    (form.activeCuriosity === "low" || form.activeCuriosity === "none" || form.activeCuriosity === "reactive");

  const overallRisk = clamp(
    intakeMode === "narrative"
      ? narrativeComposite + (includesAny(narrativeBlob, ["忽冷忽热", "没有plan b", "不问我", "只聊自己"]) ? 10 : 0)
      : profileTension * 0.17 +
        relationshipFriction * 0.18 +
        telemetryRisk * 0.33 +
        eventRisk * 0.2 +
        intuitionRisk * 0.12 +
        (emotionalContainer ? 8 : 0) +
        (intermittentReinforcement ? 10 : 0) +
        (capitalInvestmentImbalance ? 8 : 0),
  );

  const verdictLabel =
    overallRisk >= 72 ? "高风险（建议撤退）" : overallRisk >= 46 ? "中风险（启动压力测试）" : "低风险（正常发展）";

  const verdict =
    overallRisk >= 72
      ? "高风险关系。行为证据已经比话术更响，继续投入大概率只会加深你的自我消耗。"
      : overallRisk >= 46
        ? "中风险关系。局部还没烂透，但必须尽快通过压力测试验证真实意图。"
        : "低风险关系。暂未看到强操纵结构，可以继续观察正常发展。";

  const patternAnalysis =
    intakeMode === "narrative"
      ? overallRisk >= 72
        ? "你提供的叙述更像一种高情绪浓度、低关系确定性的互动结构。对方会释放连接感，但这种连接感缺乏连续投入与稳定推进。"
        : overallRisk >= 46
          ? "这段关系呈现出明显的热度波动和投入不均，说明它并不是稳定升温，而更像在试探、观望与情绪连接之间来回摆动。"
          : "从目前文本看，关系里有波动，但还没有形成足够清晰的操纵结构。更像是不成熟或节奏不稳，而非明确控制。"
      : overallRisk >= 72
        ? "结构化样本显示，这段关系的核心问题不是有没有吸引力，而是热度、互惠和承诺之间严重失衡。"
        : overallRisk >= 46
          ? "结构化样本显示，你们之间存在连接感，但连接的方式并不稳定，容易让人误把阶段性热情当成长期投入。"
          : "结构化样本显示，目前的主要问题是噪音和不确定性，而不是非常明确的情感操纵。";

  const psychologyAnalysis =
    emotionalContainer && intermittentReinforcement
      ? "从心理机制上看，这种模式容易形成间歇性强化：高回应期给你奖励，低回应期制造悬念。接收方往往会因为不确定性而投入更多注意力。同时，如果对方主要输出自己的感受，却不稳定承接你的现实处境，你就容易被放在“情绪容器”的位置。"
      : capitalInvestmentImbalance
        ? "从心理动力上看，这更像一种不对称连接：一方享受被理解、被关注、被接住，另一方则在不断追加解释、耐心和情绪劳动。问题不一定来自恶意，而可能来自对关系责任和情绪收益的不同预期。"
        : "从心理学角度看，当前更像是依恋节奏不一致或关系投入能力不均，而不是已经可以直接下“人格操纵”结论。真正需要警惕的，是反复波动如何改变你的期待和判断。";

  const implicationAnalysis =
    overallRisk >= 72
      ? "对你而言，最大的风险不是她是不是坏，而是你会持续被一种不稳定但偶尔高回报的互动节奏牵引。长期处在这种关系里，人会越来越依赖对方偶发的热情来确认自身位置。"
      : overallRisk >= 46
        ? "对你而言，这段关系最大的现实意义是：它可能让你持续保持希望，却迟迟得不到结构化答案。也就是说，消耗你的未必是冲突，而是模糊。"
        : "对你而言，目前更适合继续观察行为一致性，而不是过早下结论。关键要看对方后续是否能把语言热度变成行动和稳定性。";

  const objectivityNote =
    "这份分析针对的是行为模式，不是人格定罪。系统可以判断互动是否失衡、是否高波动、是否低互惠，但不能仅凭这些信息就断言对方一定“恶意操纵”或“就是某种人”。";

  const confidenceNote =
    intakeMode === "narrative"
      ? "当前结论基于自由叙述中的行为线索和关键词模式，适合做初步判断，但不等于临床级心理评估。"
      : "当前结论基于结构化字段与规则权重，稳定性更高，但仍然属于行为分析工具，而不是对人格的绝对判词。";

  const pressureTestTitle =
    overallRisk >= 72 ? "边界确认消息" : overallRisk >= 46 ? "关系推进测试" : "轻量澄清消息";

  const pressureTestMessage =
    overallRisk >= 72
      ? "我对一段关系的判断标准很简单：热情可以有波动，但投入不能长期模糊。最近我们的互动让我感受到连接感，但缺少稳定推进。如果你只是想保持轻松聊天，我们可以把它定义清楚；如果你确实想认真发展，那就请给出一个明确的时间点和实际安排。"
      : overallRisk >= 46
        ? "我其实不介意节奏慢，但我会在意关系是不是在往前走。我们最近有连接感，但节奏有点忽近忽远。我想确认一下，你是想认真继续了解，还是更倾向于保持轻松随缘？如果是前者，我们可以定一个具体的下一步。"
        : "我觉得我们聊得还不错，我也愿意继续了解。只是我更喜欢清楚一点的节奏，所以想确认下，你会更希望我们自然慢慢来，还是可以尝试安排一个更明确的下一步？";

  const pressureTestWhy =
    overallRisk >= 72
      ? "这条消息的作用不是挽回，而是切断模糊收益。真正想推进的人会回应“怎么推进”，只想维持暧昧收益的人通常会继续回避结构化表达。"
      : overallRisk >= 46
        ? "这条消息会迫使对方把“热情”转译成“立场”。如果对方只能继续给感觉而给不出方向，问题就不在你理解错了，而在她本来就不想说清。"
        : "这条消息的作用是轻量确认节奏，不会显得咄咄逼人，同时能观察对方是否愿意给出一致行动。";

  const methodology =
    "当前版本并没有接入外部大模型做推理式心理诊断，而是用前端规则引擎结合行为心理学框架做解释：看热度波动、互惠性、边界、承诺与关键事件，再生成报告文案。它的优势是稳定、透明、可解释；局限是对复杂语境的理解深度，还不等于真人咨询或高质量大模型长推理。";

  const indicators: Metric[] = [
    {
      label: "情绪容器指数",
      score: emotionalContainer ? 89 : Math.round(clamp(telemetryRisk * 0.72)),
      tone: emotionalContainer ? "danger" : telemetryRisk >= 55 ? "warn" : "safe",
      summary: emotionalContainer
        ? "你承接了深度情绪，对方却没有回收你的现实压力。你像容器，不像被认真经营的对象。"
        : "当前情绪承接关系尚未失衡到极端，但互惠质量并不算高。",
    },
    {
      label: "间歇性强化",
      score: intermittentReinforcement ? 92 : Math.round(clamp(riskOf(responseRiskMap, form.responseConsistency))),
      tone: intermittentReinforcement ? "danger" : "safe",
      summary: intermittentReinforcement
        ? "高热度后消失，或者秒回与轮回循环，本质上都在放大奖励不确定性。"
        : "沟通节奏相对稳定，暂未形成明显成瘾式牵引。",
    },
    {
      label: "资本与投入失衡",
      score: capitalInvestmentImbalance ? 84 : Math.round(clamp(profileTension * 0.55 + telemetryRisk * 0.45)),
      tone: capitalInvestmentImbalance ? "danger" : profileTension >= 55 ? "warn" : "safe",
      summary: capitalInvestmentImbalance
        ? "背景与投入明显不对称，对方更像在消费情绪关注，而不是建设关系。"
        : "背景差异存在，但是否构成关系剥削仍取决于后续投入表现。",
    },
    {
      label: "事实落地能力",
      score: Math.round(eventRisk),
      tone: eventRisk >= 68 ? "danger" : eventRisk >= 45 ? "warn" : "safe",
      summary:
        eventRisk >= 68
          ? "一到关键节点就拒绝、拖延或不提供 Plan B，说明意图并不稳定。"
          : "关键摩擦目前还可解释，但仍需观察兑现能力。",
    },
  ];

  const redFlags: string[] = [];

  if (form.activeCuriosity === "low" || form.activeCuriosity === "none") {
    redFlags.push("对方几乎不主动询问你的压力、规划或未来方向。");
  }
  if (form.reciprocity === "partnerDumps") {
    redFlags.push("对方只在自己需要倾诉时靠近你，互惠性明显失衡。");
  }
  if (intermittentReinforcement) {
    redFlags.push("存在高热度后无征兆消失，或秒回与轮回循环。");
  }
  if (form.frictionType === "dateRefusal" && form.refusalStyle !== "withPlanB") {
    redFlags.push("拒绝见面时没有给出明确 Plan B，说明推进意愿不足。");
  }
  if (form.relationshipState === "undefinedExclusive" || form.relationshipState === "stalled") {
    redFlags.push("互动像恋爱，却迟迟不给定义，关系红利在拿，责任在回避。");
  }
  if (form.personalityRead === "publicHotPrivateCold") {
    redFlags.push("公开场合热络，私下冷淡，说明吸引力展示和真实投入并不一致。");
  }
  if (includesAny(confusionText, selfFantasyKeywords)) {
    redFlags.push("你的叙述里出现了反复替对方找理由的迹象，存在自我攻略风险。");
  }
  if (intakeMode === "narrative" && includesAny(narrativeBlob, ["没有plan b", "没有替代方案"])) {
    redFlags.push("你提供的叙述里出现了拒绝后没有替代方案，这通常意味着推进优先级偏低。");
  }
  if (intakeMode === "narrative" && includesAny(narrativeBlob, ["只聊自己", "不问我"])) {
    redFlags.push("自由叙述中出现了明显的单向输出信号，对方可能更把你当情绪接收器。");
  }

  const action =
    overallRisk >= 72
      ? [
          "停止主动联系 48 小时，观察对方是否会主动补位并给出具体行动。",
          "暂停继续做情绪支持，不再无条件接住对方深夜倾诉与临时召回。",
          "如果对方再次提出模糊邀约，只接受带具体时间与方案的推进。"
        ]
      : overallRisk >= 46
        ? [
            "发起一次压力测试，只提一个明确问题：这段关系接下来怎么推进，时间点是什么。",
            "把主动联系频率降到对方的一半，看其是否愿意回拉关系。",
            "记录未来两周的兑现率，不讨论感觉，只记事实。"
          ]
        : [
            "维持正常接触频率，不要提前透支承诺或情绪投入。",
            "继续观察对方是否会主动问及你的现实处境与未来规划。",
            "把下一次约见是否能顺利落地，作为关系是否升级的信号。"
          ];

  const stageInsights: StageInsight[] = [
    {
      stage: 0,
      title: "背景扫描",
      insight:
        profileTension >= 60
          ? "背景与阶段感已经出现错位。你们的问题不只是聊天感觉，而是人生节奏可能根本不同步。"
          : "基础画像没有明显硬伤，但后续仍要看投入是否配得上背景。 ",
    },
    {
      stage: 1,
      title: "坐标校准",
      insight:
        relationshipFriction >= 60
          ? "认识路径、距离和关系定义都在抬高沟通成本，这种局很容易靠想象续命。"
          : "关系坐标还算清晰，说明后续重点应该放在行为兑现，而非定义争夺。",
    },
    {
      stage: 2,
      title: "行为遥测",
      insight:
        telemetryRisk >= 68
          ? "核心风险已经暴露在互动模式里。真正伤人的不是一句话，而是长期不对称的节奏与关心。"
          : "互动层面暂未出现极端失衡，但还需要持续看互惠质量。",
    },
    {
      stage: 3,
      title: "事件验真",
      insight:
        eventRisk >= 68
          ? "关键事件里最值钱的是 Plan B。拒绝本身不可怕，没有替代方案才说明优先级低。"
          : "这次摩擦尚未构成致命证据，但仍要警惕口头安抚代替真实行动。",
    },
    {
      stage: 4,
      title: "直觉去噪",
      insight:
        intuitionRisk >= 60
          ? "你现在最需要的不是更多猜测，而是停止替对方解释，回到事实。"
          : "你的诉求相对清晰，说明仍有空间用理性测试取代情绪内耗。",
    },
  ];

  const notes = [
    intakeMode === "narrative"
      ? "当前为自由叙述模式，系统根据文本线索生成初步判断，后续可接入更强的文本解析。"
      : "当前为结构化采集模式，系统按行为字段与规则权重生成判断。",
    keywordPlanBDetected
      ? "事件文本中检测到替代安排关键词，但仍需看是否给出具体时间。"
      : "事件文本中没有识别到明确替代安排信号。",
    emotionalContainer
      ? "系统判定你有被当作情绪容器的风险。"
      : "尚未触发“情绪容器”强规则。",
    capitalInvestmentImbalance
      ? "已触发“资本与投入失衡”规则。"
      : "资本差异存在，但还未单独构成结论。",
  ];

  return {
    riskScore: Math.round(overallRisk),
    verdict,
    verdictLabel,
    indicators,
    radar: [
      { label: "背景匹配", value: Math.round(100 - profileTension) },
      { label: "关系清晰", value: Math.round(100 - relationshipFriction) },
      { label: "互惠质量", value: Math.round(100 - telemetryRisk) },
      { label: "落地能力", value: Math.round(100 - eventRisk) },
    ],
    stageInsights,
    redFlags,
    action,
    notes,
    analysis: {
      pattern: patternAnalysis,
      psychology: psychologyAnalysis,
      implication: implicationAnalysis,
      objectivity: objectivityNote,
      confidence: confidenceNote,
    },
    pressureTest: {
      title: pressureTestTitle,
      message: pressureTestMessage,
      whyItWorks: pressureTestWhy,
    },
    methodology,
  };
}
