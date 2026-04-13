type MetricCardProps = {
  label: string;
  score: number;
  summary: string;
  tone: "danger" | "warn" | "safe";
};

const toneClasses: Record<MetricCardProps["tone"], string> = {
  danger: "border-rose/30 bg-rose/10 text-rose-100",
  warn: "border-amber/30 bg-amber/10 text-amber-100",
  safe: "border-mint/30 bg-mint/10 text-mint-100",
};

export function MetricCard({ label, score, summary, tone }: MetricCardProps) {
  return (
    <article className={`rounded-3xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-200">{summary}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">风险值</p>
          <p className="font-display text-3xl text-white">{score}</p>
        </div>
      </div>
    </article>
  );
}
