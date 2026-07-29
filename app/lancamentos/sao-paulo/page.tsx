import type { Metadata } from "next";
import { AreaListingPage } from "@/components/seo/AreaListingPage";

export const metadata: Metadata = {
  title: "Lançamentos em São Paulo",
  description: "Compare lançamentos imobiliários em São Paulo pelo RC Vend, com bairros estratégicos e atendimento consultivo.",
  alternates: { canonical: "/lancamentos/sao-paulo" },
};

export default function SaoPauloLaunchesPage() {
  return (
    <AreaListingPage
      eyebrow="Lançamentos em São Paulo"
      title="Lançamentos em São Paulo para acompanhar e comparar."
      description="Conheça novos empreendimentos, regiões em destaque e oportunidades para comprar na planta ou investir."
      city="Sao Paulo"
      purpose="launch"
      relatedLinks={[
        { href: "/lancamentos/sao-paulo/brooklin", label: "Lançamentos no Brooklin" },
        { href: "/imoveis/sao-paulo", label: "Imóveis em São Paulo" },
        { href: "/imoveis/sao-paulo/moema", label: "Imóveis em Moema" },
      ]}
    />
  );
}
