import { Search } from "lucide-react";

type PropertyFiltersProps = {
  q?: string;
  purpose?: string;
  stage?: string;
  type?: string;
  sort?: string;
};

export function PropertyFilters({ q, purpose = "all", stage = "all", type = "all", sort = "recent" }: PropertyFiltersProps) {
  return (
    <form action="/imoveis" className="rounded-3xl border border-line bg-white p-4 shadow-[0_18px_50px_rgba(10,45,42,0.10)] sm:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_150px_190px_170px_190px_130px]">
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
        <select name="sort" aria-label="Ordenação" defaultValue={sort} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-semibold">
          <option value="recent">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="area_desc">Maior área</option>
        </select>
        <button className="rounded-2xl bg-cta px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-cta/20 transition hover:bg-cta-hover">Buscar</button>
      </div>
    </form>
  );
}
