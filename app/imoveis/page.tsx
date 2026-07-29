import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { getProperties } from "@/lib/properties";
import type { PropertyFilters as Filters } from "@/types/property";

export const metadata: Metadata = {
  title: "Imóveis para comprar, alugar e comparar",
  description: "Busque imóveis para comprar, alugar e acompanhar lançamentos em São Paulo no RC Vend.",
  alternates: { canonical: "/imoveis" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getPaginationHref(params: Record<string, string | string[] | undefined>, page: number) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue && key !== "page") query.set(key, firstValue);
  }

  query.set("page", String(page));
  return `/imoveis?${query.toString()}`;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedPage = Number(getParam(params, "page") ?? "1");
  const filters: Filters = {
    q: getParam(params, "q"),
    purpose: (getParam(params, "purpose") as Filters["purpose"]) ?? "all",
    stage: (getParam(params, "stage") as Filters["stage"]) ?? "all",
    type: (getParam(params, "type") as Filters["type"]) ?? "all",
    program: (getParam(params, "program") as Filters["program"]) ?? "all",
    sort: (getParam(params, "sort") as Filters["sort"]) ?? "recent",
    page: Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1,
  };
  const allProperties = await getProperties(filters);
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(allProperties.length / pageSize));
  const currentPage = Math.min(filters.page ?? 1, totalPages);
  const properties = allProperties.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong pb-16 pt-12 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Busca RC Vend</p>
          <h1 className="mt-3 max-w-5xl text-4xl font-extrabold md:text-5xl">Encontre o imóvel certo para o seu momento.</h1>
          <p className="mt-4 max-w-3xl text-white/70">Compare oportunidades para comprar, alugar ou investir em lançamentos com informações claras e contato direto.</p>
        </div>
      </section>

      <section className="container-page -mt-8 pb-16">
        <PropertyFilters q={filters.q} purpose={filters.purpose} stage={filters.stage} type={filters.type} program={filters.program} sort={filters.sort} />
        <div className="mt-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-muted">{allProperties.length} imóveis encontrados</p>
            <p className="text-sm text-muted">Ordene e refine sua busca para comparar melhor</p>
          </div>
          <Link href="/mapa#mapa" className="inline-flex items-center justify-center rounded-2xl border border-brand px-5 py-3 text-sm font-black text-brand hover:bg-brand hover:text-white">
            Ver imóveis no mapa
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
        {properties.length === 0 && (
          <div className="mt-8 rounded-3xl border border-line bg-white p-10 text-center">
            <h2 className="text-2xl font-extrabold">Nenhum imóvel encontrado</h2>
            <p className="mt-2 text-muted">Tente remover filtros ou buscar por outro bairro.</p>
          </div>
        )}
        {allProperties.length > pageSize ? (
          <nav aria-label="Paginação dos imóveis" className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {currentPage > 1 ? (
              <Link href={getPaginationHref(params, currentPage - 1)} className="rounded-full border border-brand px-5 py-3 text-sm font-black text-brand transition hover:bg-brand hover:text-white">
                Página anterior
              </Link>
            ) : null}
            <span className="px-3 text-sm font-bold text-muted">Página {currentPage} de {totalPages}</span>
            {currentPage < totalPages ? (
              <Link href={getPaginationHref(params, currentPage + 1)} className="rounded-full bg-brand px-5 py-3 text-sm font-black text-white transition hover:bg-brand-strong">
                Próxima página
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  );
}
