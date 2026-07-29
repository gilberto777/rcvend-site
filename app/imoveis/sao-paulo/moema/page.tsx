import type { Metadata } from "next";
import { AreaListingPage } from "@/components/seo/AreaListingPage";

export const metadata: Metadata = {
  title: "Imóveis em Moema, São Paulo",
  description: "Encontre imóveis em Moema, São Paulo, com oportunidades para morar, investir ou alugar.",
  alternates: { canonical: "/imoveis/sao-paulo/moema" },
};

export default function MoemaPropertiesPage() {
  return (
    <AreaListingPage
      eyebrow="Imóveis em Moema"
      title="Imóveis em Moema para comparar localização, conforto e rotina."
      description="Veja oportunidades em Moema e compare preço, metragem, vagas e diferenciais com mais clareza."
      city="Sao Paulo"
      neighborhood="Moema"
      relatedLinks={[
        { href: "/imoveis/sao-paulo", label: "Imóveis em São Paulo" },
        { href: "/imoveis/sao-paulo/brooklin", label: "Imóveis no Brooklin" },
        { href: "/lancamentos/sao-paulo", label: "Lançamentos em São Paulo" },
      ]}
    />
  );
}
