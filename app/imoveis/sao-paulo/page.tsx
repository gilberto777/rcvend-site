import type { Metadata } from "next";
import { AreaListingPage } from "@/components/seo/AreaListingPage";

export const metadata: Metadata = {
  title: "Imóveis em São Paulo",
  description: "Encontre imóveis para comprar, alugar e comparar oportunidades em São Paulo pelo RC Vend.",
  alternates: { canonical: "/imoveis/sao-paulo" },
};

export default function SaoPauloPropertiesPage() {
  return (
    <AreaListingPage
      eyebrow="Imóveis em São Paulo"
      title="Imóveis em São Paulo para comprar, alugar e comparar."
      description="Explore oportunidades em bairros estratégicos de São Paulo, com busca clara e atendimento consultivo."
      city="Sao Paulo"
      relatedLinks={[
        { href: "/imoveis/sao-paulo/brooklin", label: "Imóveis no Brooklin" },
        { href: "/imoveis/sao-paulo/moema", label: "Imóveis em Moema" },
        { href: "/lancamentos/sao-paulo", label: "Lançamentos em São Paulo" },
      ]}
    />
  );
}
