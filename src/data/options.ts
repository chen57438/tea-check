export type FormState = {
  dynamicStage: string;
  ageGap: string;
  socialBackground: string;
  cultureAtmosphere: string;
  familyAttitude: string;
  personalityRead: string;
  profileNotes: string;
  howLongKnown: string;
  connectionOrigin: string;
  distanceMode: string;
  relationshipState: string;
  relationshipNotes: string;
  initiativeBalance: number;
  responseConsistency: string;
  conversationDepth: string;
  reciprocity: string;
  activeCuriosity: string;
  interactionNotes: string;
  frictionStory: string;
  frictionType: string;
  refusalStyle: string;
  confusionPoint: string;
  coreNeed: string;
  narrativeText: string;
};

export const stepLabels = [
  "基础画像",
  "关系坐标",
  "互动模式",
  "关键事件",
  "直觉校准",
];

export const dynamicStageOptions = [
  { label: "双方都在冲刺期，节奏接近", value: "alignedSprint" },
  { label: "我在职场推进，对方仍在学生阶段", value: "userWorkPartnerStudy" },
  { label: "我还在过渡期，对方已进入成熟职场", value: "userStudyPartnerWork" },
  { label: "人生节奏严重错位，一个认真一个随缘", value: "mismatched" },
  { label: "一方刚结束旧关系，另一方已经想推进", value: "timingMismatch" },
  { label: "双方都忙，但至少目标感一致", value: "busyButAligned" },
];

export const ageGapOptions = [
  { label: "同龄或相差 0-2 岁", value: "close" },
  { label: "相差 3-5 岁，但阶段相近", value: "medium" },
  { label: "相差 6 岁以上，阶段感明显不同", value: "large" },
  { label: "年龄差不大，但成熟度差明显", value: "maturityGap" },
];

export const socialBackgroundOptions = [
  { label: "双方背景接近，资源与见识差不多", value: "aligned" },
  { label: "我更稳定，对方履历普通", value: "userStronger" },
  { label: "对方背景更强，资源位更高", value: "partnerStronger" },
  { label: "背景差异大，常有价值错位", value: "misaligned" },
  { label: "表面背景相近，但消费观和阶层感差很多", value: "lifestyleGap" },
];

export const cultureOptions = [
  { label: "文化氛围接近，表达习惯兼容", value: "compatible" },
  { label: "一方留学/海归，沟通方式更抽离", value: "globalized" },
  { label: "原生家庭较保守，情感表达克制", value: "reserved" },
  { label: "价值观氛围冲突，经常对不上频道", value: "conflicted" },
  { label: "社交表达很现代，但承诺观念很传统", value: "mixedSignals" },
  { label: "对方习惯高社交密度，我偏稳定低噪音", value: "socialStyleGap" },
];

export const familyOptions = [
  { label: "家庭态度开放，不干预关系推进", value: "open" },
  { label: "家庭影响中等，偶尔左右决策", value: "moderate" },
  { label: "家庭强势，关系选择受控明显", value: "strong" },
  { label: "家庭态度模糊，被当作拖延借口", value: "excuse" },
  { label: "对方长期把家庭压力当作不表态理由", value: "shield" },
];

export const personalityOptions = [
  { label: "社交场合热络，私下同样稳定", value: "consistentWarm" },
  { label: "社交场合活跃，私下明显冷淡", value: "publicHotPrivateCold" },
  { label: "高魅力外放，但不愿承担关系责任", value: "charmingAvoidant" },
  { label: "表现含糊，像在测试别人底线", value: "probing" },
  { label: "会共情，但一到承诺节点就后撤", value: "softButEscaping" },
  { label: "对所有人都热情，很难判断你是否特殊", value: "universallyWarm" },
  { label: "私下依赖你，公开场合却不给身份感", value: "privateNeedPublicDistance" },
];

export const durationOptions = [
  { label: "刚认识 1 个月内", value: "new" },
  { label: "1-3 个月，热度期", value: "warming" },
  { label: "3-6 个月，进入验证期", value: "testing" },
  { label: "超过半年，仍未清晰定义", value: "dragging" },
  { label: "断断续续联系很久，但一直没落地", value: "onOffLongTerm" },
];

export const originOptions = [
  { label: "现实生活 / 朋友介绍", value: "offline" },
  { label: "社交软件认识", value: "datingApp" },
  { label: "线上长期聊天后线下见面", value: "hybrid" },
  { label: "工作 / 学校场景叠加熟悉感", value: "institutional" },
  { label: "前任回流 / 旧识重联", value: "reconnected" },
  { label: "社群 / 兴趣圈层认识", value: "community" },
];

export const distanceOptions = [
  { label: "同城，见面成本低", value: "sameCity" },
  { label: "跨城，但还能计划见面", value: "regional" },
  { label: "长期异地，沟通成本高", value: "longDistance" },
  { label: "物理上不远，但总像隔着墙", value: "emotionallyFar" },
  { label: "同城但总约不出来", value: "sameCityNoMeet" },
  { label: "时间表严重错位，很难同步", value: "scheduleConflict" },
];

export const statusOptions = [
  { label: "刚开始接触，互相评估", value: "early" },
  { label: "持续暧昧，但没有承诺", value: "situationship" },
  { label: "像恋爱，但对方拒绝定义", value: "undefinedExclusive" },
  { label: "关系停滞，靠偶发热度续命", value: "stalled" },
  { label: "已发生亲密互动，但关系仍模糊", value: "intimateButUndefined" },
  { label: "口头说认真了解，行动却不升级", value: "verbalIntentOnly" },
];

export const responseOptions = [
  { label: "基本稳定，可预测", value: "stable" },
  { label: "秒回与轮回交替出现", value: "hotColdCycle" },
  { label: "高热度后无征兆消失", value: "vanishAfterHeat" },
  { label: "只在无聊或需要时出现", value: "utilityDriven" },
  { label: "工作日失踪，周末深夜突然出现", value: "weekendOnly" },
  { label: "回复看似礼貌，但始终不推进", value: "politeButStatic" },
];

export const depthOptions = [
  { label: "以轻松闲聊为主，深度不高", value: "light" },
  { label: "生活报备偏多，像流水账维系", value: "reporting" },
  { label: "会谈价值观、压力与脆弱点", value: "deep" },
  { label: "深度暴露很多，但落地投入很少", value: "deepButCheap" },
  { label: "会聊未来想法，但从不落到共同计划", value: "futureTalkNoPlan" },
  { label: "话题多数围绕对方的情绪与处境", value: "selfCentricDepth" },
];

export const reciprocityOptions = [
  { label: "能互相提供情绪价值", value: "mutual" },
  { label: "我更常接住对方情绪", value: "userCarries" },
  { label: "对方只在倾诉时来找我", value: "partnerDumps" },
  { label: "谁都没认真支持谁", value: "empty" },
  { label: "会安慰我，但轮到行动时缺席", value: "verbalOnlySupport" },
  { label: "我一表达需求，对方就转移话题", value: "deflecting" },
];

export const curiosityOptions = [
  { label: "会主动问我的压力和规划", value: "high" },
  { label: "偶尔会问，但很浅", value: "medium" },
  { label: "几乎不问，只顾自己表达", value: "low" },
  { label: "完全不问，把我当背景板", value: "none" },
  { label: "只在害怕失去我时短暂关心", value: "reactive" },
];

export const frictionTypeOptions = [
  { label: "拒绝见面 / 临时放鸽子", value: "dateRefusal" },
  { label: "失联 / 延迟回复引发摩擦", value: "disappear" },
  { label: "暧昧边界不清，引发不适", value: "boundary" },
  { label: "未来承诺模糊，持续画饼", value: "futureFake" },
];

export const refusalStyleOptions = [
  { label: "拒绝时给了明确 Plan B", value: "withPlanB" },
  { label: "口头说改天，但没有具体时间", value: "softPlanB" },
  { label: "直接拒绝，没有替代方案", value: "withoutPlanB" },
  { label: "连解释都很敷衍，像在打发", value: "dismissive" },
];

export const defaultForm: FormState = {
  dynamicStage: "userWorkPartnerStudy",
  ageGap: "medium",
  socialBackground: "partnerStronger",
  cultureAtmosphere: "globalized",
  familyAttitude: "moderate",
  personalityRead: "publicHotPrivateCold",
  profileNotes: "",
  howLongKnown: "testing",
  connectionOrigin: "datingApp",
  distanceMode: "regional",
  relationshipState: "situationship",
  relationshipNotes: "",
  initiativeBalance: 72,
  responseConsistency: "vanishAfterHeat",
  conversationDepth: "deepButCheap",
  reciprocity: "partnerDumps",
  activeCuriosity: "low",
  interactionNotes: "",
  frictionStory: "上周约见面，对方说最近很忙先算了，之后没有主动给新的时间，只在两天后突然发来一句晚安。",
  frictionType: "dateRefusal",
  refusalStyle: "withoutPlanB",
  confusionPoint: "我总觉得她是不是其实在试探我耐心，所以我不断给她找理由。",
  coreNeed: "我想确认这段关系是不是能稳定推进，而不是一直靠我自己脑补。",
  narrativeText: "",
};
