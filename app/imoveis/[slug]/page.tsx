import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, Bath, BedDouble, BriefcaseBusiness, Car, MapPin, MessageCircle, Ruler } from "lucide-react";
import { LeadForm } from "@/components/property/LeadForm";
import { FloorPlansGallery } from "@/components/property/FloorPlansGallery";
import { FormattedDescription } from "@/components/property/FormattedDescription";
import { PropertyMediaExtras } from "@/components/property/PropertyMediaExtras";
import { PropertyPhotoGallery } from "@/components/property/PropertyPhotoGallery";
import { PropertyCard } from "@/components/property/PropertyCard";
import { NeighborhoodInsight } from "@/components/property/NeighborhoodInsight";
import { PropertiesMapShell } from "@/components/property/PropertiesMapShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { formatArea, formatDisplayText, formatPropertyPrice, getWhatsAppUrl } from "@/lib/formatters";
import { getProperties, getPropertyBySlug } from "@/lib/properties";
import type { Property } from "@/types/property";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const neighborhoodCoordinates: Record<string, { latitude: number; longitude: number }> = {
  brooklin: { latitude: -23.6204, longitude: -46.6941 },
  moema: { latitude: -23.6035, longitude: -46.6634 },
  "vila mariana": { latitude: -23.5892, longitude: -46.6346 },
  paraiso: { latitude: -23.5746, longitude: -46.6417 },
  "chacara santo antonio": { latitude: -23.6333, longitude: -46.7097 },
  "alto da boa vista": { latitude: -23.6404, longitude: -46.7046 },
  "itaim bibi": { latitude: -23.5844, longitude: -46.6788 },
  higienopolis: { latitude: -23.5447, longitude: -46.6573 },
  "jardim paulista": { latitude: -23.5705, longitude: -46.6622 },
  "santo amaro": { latitude: -23.6548, longitude: -46.7108 },
  "vila clementino": { latitude: -23.5981, longitude: -46.6437 },
  saude: { latitude: -23.6187, longitude: -46.6388 },
};

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getMapProperty(property: Property) {
  if (Number.isFinite(Number(property.latitude)) && Number.isFinite(Number(property.longitude))) {
    return { property, isApproximate: false };
  }

  const coordinates =
    neighborhoodCoordinates[normalizeLocation(property.neighborhood)] ??
    (normalizeLocation(property.city) === "sao paulo" ? { latitude: -23.5558, longitude: -46.6396 } : null);
  if (!coordinates) return { property: null, isApproximate: true };

  return {
    property: {
      ...property,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
    isApproximate: true,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Imóvel não encontrado" };
  const plainDescription = stripHtml(property.meta_description ?? property.description);

  return {
    title: formatDisplayText(property.meta_title ?? property.title),
    description: plainDescription,
    alternates: { canonical: `/imoveis/${property.slug}` },
    openGraph: {
      title: formatDisplayText(property.title),
      description: plainDescription,
      images: [property.cover_image],
      type: "article",
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  const plainDescription = stripHtml(property.description);
  const displayTitle = formatDisplayText(property.title);
  const displayNeighborhood = formatDisplayText(property.neighborhood);
  const displayCity = formatDisplayText(property.city);
  const mapProperty = getMapProperty(property);

  const related = (await getProperties({ city: property.city }))
    .filter((item) => item.id !== property.id)
    .slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: displayTitle,
    description: plainDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: displayCity,
      addressRegion: property.state,
      streetAddress: property.address,
    },
    image: property.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "BRL",
      availability: property.status === "available" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PropertyPhotoGallery
        coverImage={property.cover_image}
        title={displayTitle}
        images={property.images}
        videoUrl={property.video_url}
        tourUrl={property.tour_url}
      />

      <section className="container-page grid gap-10 pb-16 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <MapPin className="h-4 w-4" />
            {displayNeighborhood}, {displayCity} - {property.state}
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight md:text-5xl">{displayTitle}</h1>
            {property.code ? <span className="rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-muted">Código {property.code}</span> : null}
          </div>
          <p className="mt-4 text-3xl font-extrabold text-brand">{formatPropertyPrice(property)}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailMetric icon={Ruler} value={formatArea(property.area)} label="Área" />
            {property.type === "studio" ? <DetailMetric icon={BedDouble} value="Studio" label="Tipo do imóvel" /> : null}
            {property.type === "commercial" ? <DetailMetric icon={BriefcaseBusiness} value="Comercial" label="Tipo do imóvel" /> : null}
            {property.type !== "studio" && property.type !== "commercial" && property.bedrooms > 0 ? <DetailMetric icon={BedDouble} value={String(property.bedrooms)} label="Dormitórios" /> : null}
            {property.bathrooms > 0 ? <DetailMetric icon={Bath} value={String(property.bathrooms)} label="Banheiros" /> : null}
            {property.parking_spaces > 0 ? <DetailMetric icon={Car} value={String(property.parking_spaces)} label="Vagas" /> : null}
          </div>

          <section className="mt-10 rounded-3xl border border-line bg-white p-7">
            <h2 className="text-2xl font-extrabold">Descrição</h2>
            <FormattedDescription value={formatDisplayText(property.description)} />
          </section>

          <section className="mt-6 rounded-3xl border border-line bg-white p-7">
            <h2 className="text-2xl font-extrabold">Características</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {property.characteristics.map((item) => (
                <span key={item} className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted">{formatDisplayText(item)}</span>
              ))}
            </div>
          </section>

          {property.floor_plans?.length ? <FloorPlansGallery plans={property.floor_plans} /> : null}

          <PropertyMediaExtras videoUrl={property.video_url} tourUrl={property.tour_url} title={displayTitle} />

          <section className="mt-6 rounded-3xl border border-line bg-white p-7">
            <h2 className="text-2xl font-black">Localização aproximada</h2>
            {mapProperty.property ? (
              <>
                <div className="mt-4 overflow-hidden rounded-3xl border border-line">
                  <PropertiesMapShell properties={[mapProperty.property]} heightClassName="min-h-[360px]" />
                </div>
                <p className="mt-3 text-sm text-muted">
                  {mapProperty.isApproximate
                    ? "Marcador aproximado pelo bairro. Endereço exato informado após contato, quando aplicável."
                    : "Marcador gerado pelas coordenadas cadastradas do imóvel."}
                </p>
              </>
            ) : (
              <div className="mt-4 grid min-h-72 place-items-center rounded-3xl bg-[linear-gradient(135deg,#e7efe2,#f7f2e5)] text-center">
                <div>
                  <MapPin className="mx-auto h-8 w-8 text-brand" />
                  <p className="mt-3 font-extrabold text-brand">{displayNeighborhood}, {displayCity}</p>
                  <p className="mt-2 text-sm text-muted">Endereço exato informado após contato, quando aplicável.</p>
                </div>
              </div>
            )}
          </section>

          <NeighborhoodInsight neighborhood={displayNeighborhood} city={displayCity} />

          <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-black"><AlertCircle className="h-5 w-5 text-muted" />Encontrou algum problema neste anúncio?</p>
              <p className="mt-1 text-sm text-muted">Avise nossa equipe sobre informações incorretas ou indisponibilidade.</p>
            </div>
            <a href={`mailto:contato@rcvend.com.br?subject=${encodeURIComponent(`Revisar anúncio ${property.code ?? property.slug}`)}`} className="shrink-0 rounded-full border border-line px-5 py-3 text-sm font-black text-brand transition hover:border-brand">Reportar anúncio</a>
          </section>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-extrabold">Imóveis relacionados</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {related.map((item) => <PropertyCard key={item.id} property={item} />)}
              </div>
            </section>
          )}
        </article>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <LeadForm propertyId={property.id} propertyTitle={displayTitle} />
          <a
            href={getWhatsAppUrl(`Olá! Tenho interesse no imóvel ${displayTitle}: https://www.rcvend.com.br/imoveis/${property.slug}`)}
            className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-whatsapp px-5 py-4 text-center font-extrabold text-white transition hover:brightness-90"
          >
            <MessageCircle className="h-5 w-5" />
            Chamar no WhatsApp
          </a>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}

function DetailMetric({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <Icon className="h-5 w-5 text-brand" />
      <p className="mt-2 font-black">{value}</p>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
