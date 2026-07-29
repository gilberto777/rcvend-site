import { Search } from "lucide-react";
import { propertyProgramOptions } from "@/lib/property-programs";

type PropertyFiltersProps = {
  q?: string;
  purpose?: string;
  stage?: string;
  type?: string;
  program?: string;
  sort?: string;
};

export function PropertyFilters({ q, purpose = "all", stage = "all", type = "all", program = "all", sort = "recent" }: PropertyFiltersProps) {
  return (
    <form action="/imoveis" className="rounded-3xl border border-line bg-white p-4 shadow-[0_18px_50px_rgba(10,45,42,0.10)] sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-[minmax(260px,1fr)_140px_180px_160px_130px_180px_120px]">
        <label className="flex min-h-13 items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3 focus-within:border-brand/45 focus-within:bg-white">
          <Search className="h-5 w-5 text-brand" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Bairro, cidade ou empreendimento"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground caret-brand outline-none placeholder:text-muted"
          />
        </label>
        <select name="purpose" aria-label="Finalidade" defaultValue={purpose} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-semibold">
          <option value="all">Todos</option>
          <option value="sale">Comprar</option>
          <option value="rent">Alugar</option>
          <option value="launch">Lançamentos</option>
        </select>
        <select name="stage" aria-label="Fase do imóvel" defaultValue={stage} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-semibold">
          <option value="all">Todas as fases</option>
          <option value="launch">Lançamento</option>
          <option value="under_construction">Em construção</option>
          <option value="ready">Pronto para morar</option>
        </select>
        <select name="type" aria-label="Tipo de imóvel" defaultValue={type} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-semibold">
          <option value="all">Tipo</option>
          <option value="studio">Studios</option>
          <option value="apartment">Apartamentos</option>
          <option value="house">Casas</option>
          <option value="commercial">Comercial</option>
        </select>
        <select name="program" aria-label="Modalidade habitacional" defaultValue={program} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-semibold">
          <option value="all">Modalidade</option>
          {propertyProgramOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select name="sort" aria-label="Ordenação" defaultValue={sort} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-semibold">
          <option value="recent">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="area_desc">Maior área</option>
        </select>
        <button className="rounded-2xl bg-cta px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-cta/20 transition hover:bg-cta-hover">Buscar</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">Busca rápida</span>
        {propertyProgramOptions.map((option) => (
          <button
            key={option.value}
            type="submit"
            name="program"
            value={option.value}
            className="rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-black text-brand transition hover:border-brand hover:bg-brand hover:text-white"
          >
            {option.label}
          </button>
        ))}
      </div>
    </form>
  );
}
