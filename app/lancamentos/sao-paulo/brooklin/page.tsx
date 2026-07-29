import type { Metadata } from "next";
import { AreaListingPage } from "@/components/seo/AreaListingPage";

export const metadata: Metadata = {
  title: "Lançamentos no Brooklin em São Paulo",
  description: "Veja lançamentos no Brooklin em São Paulo e compare oportunidades de novos empreendimentos pelo RC Vend.",
  alternates: { canonical: "/lancamentos/sao-paulo/brooklin" },
};

export default function BrooklinLaunchesPage() {
  return (
    <AreaListingPage
      eyebrow="Lançamentos no Brooklin"
      title="Lançamentos no Brooklin para acompanhar novas oportunidades."
      description="Explore empreendimentos em uma região com mobilidade, serviços e forte demanda imobiliária."
      city="Sao Paulo"
      neighborhood="Brooklin"
      purpose="launch"
      relatedLinks={[
        { href: "/lancamentos/sao-paulo", label: "Lançamentos em São Paulo" },
        { href: "/imoveis/sao-paulo/brooklin", label: "Imóveis no Brooklin" },
        { href: "/imoveis/sao-paulo", label: "Imóveis em São Paulo" },
      ]}
    />
  );
}
