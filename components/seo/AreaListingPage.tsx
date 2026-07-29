import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PropertyCard } from "@/components/property/PropertyCard";
import { getProperties } from "@/lib/properties";
import type { PropertyFilters } from "@/types/property";

type AreaListingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  city: string;
  neighborhood?: string;
  purpose?: PropertyFilters["purpose"];
  relatedLinks?: Array<{ href: string; label: string }>;
};

export async function AreaListingPage({
  eyebrow,
  title,
  description,
  city,
  neighborhood,
  purpose = "all",
  relatedLinks = [],
}: AreaListingPageProps) {
  const properties = await getProperties({ city, neighborhood, purpose, sort: "recent" });
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    about: neighborhood ? `${neighborhood}, ${city}` : city,
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl break-words text-4xl font-black leading-tight md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{description}</p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-muted">
              <MapPinned className="h-4 w-4 text-brand" />
              {neighborhood ? `${neighborhood}, ${city}` : city}
            </p>
            <h2 className="mt-2 text-3xl font-black">Oportunidades selecionadas</h2>
          </div>
          <Link href="/imoveis" className="inline-flex items-center gap-2 font-black text-brand">
            Ver todos os imóveis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>

        {properties.length === 0 && (
          <div className="mt-8 rounded-3xl border border-line bg-white p-10 text-center">
            <h2 className="text-2xl font-black">Nenhum imóvel encontrado nesta seleção</h2>
            <p className="mt-2 text-muted">Veja todos os imóveis ou fale com um especialista para receber novas oportunidades.</p>
            <Link href="/imoveis" className="mt-5 inline-flex rounded-full bg-brand px-6 py-4 font-black text-white">
              Buscar imóveis
            </Link>
          </div>
        )}

        {relatedLinks.length > 0 && (
          <div className="mt-12 rounded-3xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Buscas relacionadas</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-full border border-line px-4 py-2 text-sm font-bold text-brand transition hover:border-brand">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
