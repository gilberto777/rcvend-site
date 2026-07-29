import type { Metadata } from "next";
import { AreaListingPage } from "@/components/seo/AreaListingPage";

export const metadata: Metadata = {
  title: "Lançamentos imobiliários em São Paulo",
  description: "Encontre lançamentos imobiliários em São Paulo e compare empreendimentos, bairros e oportunidades no RC Vend.",
  alternates: { canonical: "/lancamentos" },
};

export default function LaunchesPage() {
  return (
    <AreaListingPage
      eyebrow="Lançamentos imobiliários"
      title="Novos empreendimentos para morar ou investir."
      description="Compare lançamentos em São Paulo com informações claras, localização e atendimento direto pelo WhatsApp."
      city="Sao Paulo"
      purpose="launch"
      relatedLinks={[
        { href: "/lancamentos/sao-paulo", label: "Lançamentos em São Paulo" },
        { href: "/lancamentos/sao-paulo/brooklin", label: "Lançamentos no Brooklin" },
        { href: "/imoveis/sao-paulo", label: "Imóveis em São Paulo" },
      ]}
    />
  );
}
