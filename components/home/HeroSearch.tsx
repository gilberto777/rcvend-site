import Link from "next/link";
import { Search } from "lucide-react";

const searchTabs = [
  { label: "Comprar", href: "/imoveis?purpose=sale" },
  { label: "Alugar", href: "/imoveis?purpose=rent" },
  { label: "Lançamentos", href: "/imoveis?purpose=launch" },
  { label: "Prontos", href: "/imoveis?stage=ready" },
  { label: "Studios", href: "/imoveis?purpose=sale&q=studio" },
];

const quickExamples = ["Brooklin", "Moema", "varanda", "studio", "metrô"];

export function HeroSearch() {
  return (
    <form action="/imoveis" className="w-full rounded-[28px] border border-white/35 bg-white p-4 shadow-2xl shadow-brand-strong/25 sm:p-5 xl:p-6">
      <div className="mb-4">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand">Comece sua busca</p>
        <p className="mt-1 text-sm text-muted">Digite bairro, cidade, empreendimento ou característica.</p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl bg-background p-1 sm:grid sm:grid-cols-5 sm:overflow-visible">
        {searchTabs.map((tab, index) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-center text-sm font-extrabold transition sm:shrink ${
              index === 0 ? "bg-brand text-white shadow-sm" : "text-muted hover:bg-white hover:text-brand"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        <span className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-muted">Exemplos</span>
        {quickExamples.map((filter) => (
          <button
            key={filter}
            type="submit"
            name="q"
            value={filter}
            className="shrink-0 rounded-full border border-line bg-background px-4 py-2 text-sm font-bold text-muted transition hover:border-brand hover:text-brand"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,140px)_minmax(0,180px)_minmax(0,150px)_minmax(0,160px)]">
        <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3 focus-within:border-brand/45 focus-within:bg-white sm:col-span-2 xl:col-span-1">
          <Search className="h-5 w-5 text-brand" />
          <input
            name="q"
            placeholder="Brooklin, Moema, varanda, studio, metrô"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground caret-brand outline-none placeholder:text-muted"
          />
        </label>
        <select
          name="purpose"
          defaultValue="sale"
          className="min-h-14 min-w-0 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-brand-strong outline-none [color-scheme:light]"
        >
          <option value="sale">Comprar</option>
          <option value="rent">Alugar</option>
          <option value="launch">Lançamentos</option>
        </select>
        <select
          name="stage"
          defaultValue="all"
          aria-label="Fase do imóvel"
          className="min-h-14 min-w-0 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-brand-strong outline-none [color-scheme:light]"
        >
          <option value="all">Todas as fases</option>
          <option value="launch">Lançamento</option>
          <option value="under_construction">Em construção</option>
          <option value="ready">Pronto para morar</option>
        </select>
        <select
          name="type"
          defaultValue="all"
          className="min-h-14 min-w-0 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-brand-strong outline-none [color-scheme:light]"
        >
          <option value="all">Todos os tipos</option>
          <option value="apartment">Apartamentos</option>
          <option value="studio">Studios</option>
          <option value="house">Casas</option>
          <option value="commercial">Comercial</option>
        </select>
        <button className="min-h-14 min-w-0 rounded-2xl bg-cta px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-cta/20 transition hover:-translate-y-0.5 hover:bg-cta-hover">
          Buscar imóvel
        </button>
      </div>
    </form>
  );
}
