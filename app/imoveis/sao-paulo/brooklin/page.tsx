import type { Metadata } from "next";
import { AreaListingPage } from "@/components/seo/AreaListingPage";

export const metadata: Metadata = {
  title: "Imóveis no Brooklin em São Paulo",
  description: "Busque imóveis no Brooklin em São Paulo, com oportunidades para comprar, alugar e comparar pelo RC Vend.",
  alternates: { canonical: "/imoveis/sao-paulo/brooklin" },
};

export default function BrooklinPropertiesPage() {
  return (
    <AreaListingPage
      eyebrow="Imóveis no Brooklin"
      title="Imóveis no Brooklin para quem busca mobilidade e vida urbana."
      description="Compare studios, apartamentos e oportunidades em uma das regiões mais conectadas de São Paulo."
      city="Sao Paulo"
      neighborhood="Brooklin"
      relatedLinks={[
        { href: "/imoveis/sao-paulo", label: "Imóveis em São Paulo" },
        { href: "/lancamentos/sao-paulo/brooklin", label: "Lançamentos no Brooklin" },
        { href: "/imoveis/sao-paulo/moema", label: "Imóveis em Moema" },
      ]}
    />
  );
}
