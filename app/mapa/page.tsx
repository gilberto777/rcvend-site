import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PropertiesMapShell } from "@/components/property/PropertiesMapShell";
import { formatDisplayText, formatPropertyPrice } from "@/lib/formatters";
import { getProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Mapa de imóveis em São Paulo",
  description: "Visualize imóveis disponíveis no mapa do RC Vend e encontre oportunidades por região em São Paulo.",
  alternates: { canonical: "/mapa" },
};

export default async function PropertiesMapPage() {
  const properties = (await getProperties()).filter((property) => property.latitude && property.longitude);

  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong py-14 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Mapa RC Vend</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black md:text-5xl">Veja onde estão os imóveis disponíveis.</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Compare bairros, localização e oportunidades em uma visão única antes de abrir os detalhes.
          </p>
        </div>
      </section>

      <section id="mapa" className="container-page grid scroll-mt-24 items-start gap-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-line bg-[linear-gradient(135deg,#dfe9de,#f6f1e4)] shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:max-h-[760px]">
          <PropertiesMapShell properties={properties} />

          <div className="absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur">
            <p className="text-sm font-black text-brand">{properties.length} imóveis no mapa</p>
            <p className="mt-1 text-xs text-muted">Marcadores aproximados por latitude e longitude cadastradas.</p>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Imóveis no mapa</h2>
            <p className="mt-1 text-sm text-muted">Clique em um card para abrir os detalhes do imóvel.</p>
          </div>
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/imoveis/${property.slug}`}
              className="grid grid-cols-[96px_1fr] gap-4 rounded-3xl border border-line bg-white p-3 shadow-sm transition hover:border-brand/30 hover:shadow-lg"
            >
              <div className="relative h-24 overflow-hidden rounded-2xl bg-line">
                <Image src={property.cover_image} alt={formatDisplayText(property.title)} fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 py-1">
                <p className="line-clamp-2 font-black">{formatDisplayText(property.title)}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <MapPin className="h-4 w-4" />
                  {formatDisplayText(property.neighborhood)}
                </p>
                <p className="mt-2 font-black text-brand">{formatPropertyPrice(property)}</p>
              </div>
            </Link>
          ))}
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
