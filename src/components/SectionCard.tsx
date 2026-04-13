import type { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur xl:p-7">
      <p className="text-xs uppercase tracking-[0.32em] text-cyan/70">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-2 border-b border-white/10 pb-5">
        <h2 className="font-display text-2xl text-white">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
