import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, Mail, MessageCircle, MapPin, Ruler } from "lucide-react";
import { formatArea, formatDisplayText, formatPropertyPrice, getWhatsAppUrl } from "@/lib/formatters";
import { getPropertyProgramLabel, getPropertyPrograms } from "@/lib/property-programs";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
};

function getPropertyBadge(property: Property) {
  if (property.property_stage === "launch") return "Lançamento";
  if (property.property_stage === "under_construction") return "Em construção";
  if (property.property_stage === "ready") return "Pronto para morar";
  if (property.is_launch || property.purpose === "launch") return "Lançamento";
  if (property.is_featured) return "Destaque";
  if (property.status === "available" && property.purpose === "sale") return "Oportunidade";
  return "Pronto para morar";
}

export function PropertyCard({ property }: PropertyCardProps) {
  const badge = getPropertyBadge(property);
  const isStudio = property.type === "studio";
  const isCommercial = property.type === "commercial";
  const displayTitle = formatDisplayText(property.title);
  const programs = getPropertyPrograms(property);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/60 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_18px_45px_rgba(197,155,69,0.22)]">
      <Link href={`/imoveis/${property.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-line">
          <Image
            src={property.cover_image}
            alt={displayTitle}
            fill
            sizes="(min-width: 1536px) 24vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-brand-strong shadow-sm">{badge}</span>
            {property.purpose === "rent" ? <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-brand">Aluguel</span> : null}
          </div>
        </div>
        <div className="p-5">
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            {formatDisplayText(property.neighborhood)}, {formatDisplayText(property.city)}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-extrabold leading-snug text-foreground">{displayTitle}</h3>
          {programs.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {programs.map((program) => (
                <span key={program} className="rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-brand">
                  {getPropertyProgramLabel(program)}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-2xl font-extrabold text-brand">{formatPropertyPrice(property)}</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted">
            <span className="flex items-center gap-1"><Ruler className="h-4 w-4 text-brand" />{formatArea(property.area)}</span>
            {isStudio ? <span className="flex items-center gap-1"><BedDouble className="h-4 w-4 text-brand" />Studio</span> : null}
            {isCommercial ? <span className="flex items-center gap-1"><BedDouble className="h-4 w-4 text-brand" />Comercial</span> : null}
            {!isStudio && !isCommercial && property.bedrooms > 0 ? <span className="flex items-center gap-1"><BedDouble className="h-4 w-4 text-brand" />{property.bedrooms} dorm.</span> : null}
            {!isCommercial && property.bathrooms > 0 ? <span className="flex items-center gap-1"><Bath className="h-4 w-4 text-brand" />{property.suites > 0 ? `${property.suites} suíte${property.suites > 1 ? "s" : ""}` : `${property.bathrooms} banh.`}</span> : null}
            {property.parking_spaces > 0 ? <span className="flex items-center gap-1"><Car className="h-4 w-4 text-brand" />{property.parking_spaces} vaga{property.parking_spaces > 1 ? "s" : ""}</span> : null}
          </div>
        </div>
      </Link>
      <div className="mt-auto grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_auto] gap-2 border-t border-line px-3 py-4 sm:px-4">
        <Link
          href={`/imoveis/${property.slug}`}
          className="min-w-0 rounded-xl border border-brand/20 px-2 py-3 text-center text-xs font-extrabold text-brand transition hover:border-brand hover:bg-brand hover:text-white sm:px-3 sm:text-sm"
        >
          Ver detalhes
        </Link>
        <Link
          href={`/imoveis/${property.slug}#contato`}
          className="inline-flex min-w-0 items-center justify-center gap-1 rounded-xl bg-cta px-2 py-3 text-center text-xs font-extrabold text-white transition hover:bg-cta-hover sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Mail className="h-4 w-4" />
          Tenho interesse
        </Link>
        <a
          href={getWhatsAppUrl(`Olá! Tenho interesse no imóvel ${displayTitle}: https://www.rcvend.com.br/imoveis/${property.slug}`)}
          aria-label={`Falar no WhatsApp sobre ${displayTitle}`}
          className="grid h-11 w-11 place-items-center rounded-xl bg-whatsapp text-white transition hover:brightness-90"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>
    </article>
  );
}
