import Link from "next/link";
import { ArrowRight, Building2, MapPinned, Sparkles } from "lucide-react";

type NeighborhoodInsightProps = {
  neighborhood: string;
  city: string;
};

export function NeighborhoodInsight({ neighborhood, city }: NeighborhoodInsightProps) {
  const query = encodeURIComponent(neighborhood);

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-brand/10 bg-[linear-gradient(120deg,#f0f6f3_0%,#f7f8f3_58%,#e4efe9_100%)] p-6 sm:p-8">
      <div className="relative z-10 max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-brand">
          <MapPinned className="h-4 w-4" />
          Explore a região
        </p>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Como é morar em {neighborhood}?</h2>
        <p className="mt-3 max-w-xl leading-7 text-muted">
          Compare valores, mobilidade e outras oportunidades disponíveis em {neighborhood}, {city}, antes de decidir.
        </p>
        <Link
          href={`/imoveis?q=${query}`}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-strong"
        >
          Ver imóveis na região
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="pointer-events-none absolute -bottom-8 right-3 hidden h-48 w-80 sm:block" aria-hidden="true">
        <div className="absolute bottom-8 right-4 h-28 w-24 rounded-t-3xl bg-brand/14" />
        <div className="absolute bottom-8 right-24 h-36 w-28 rounded-t-[36px] bg-cta/18" />
        <div className="absolute bottom-8 right-48 h-24 w-20 rounded-t-3xl bg-accent/55" />
        <Building2 className="absolute bottom-12 right-28 h-24 w-24 text-brand/75" />
        <Sparkles className="absolute right-8 top-4 h-8 w-8 text-cta" />
      </div>
    </section>
  );
}
