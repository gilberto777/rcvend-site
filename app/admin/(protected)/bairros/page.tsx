import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function AdminNeighborhoodsPage() {
  return (
    <AdminPlaceholder
      title="Bairros"
      description="GestÃ£o de pÃ¡ginas SEO por bairro, descriÃ§Ãµes, imagens, meta tags e links internos estratÃ©gicos."
      entityLabel="bairro"
      actionHref="/admin/bairros/novo"
    />
  );
}
