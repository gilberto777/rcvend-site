import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function AdminAgenciesPage() {
  return (
    <AdminPlaceholder
      title="ImobiliÃ¡rias"
      description="GestÃ£o de organizaÃ§Ãµes, equipes, carteiras de imÃ³veis e regras de publicaÃ§Ã£o."
      entityLabel="imobiliÃ¡ria"
      actionHref="/admin/imobiliarias/novo"
      fields={["RazÃ£o social", "Nome fantasia", "CNPJ", "ResponsÃ¡vel", "WhatsApp", "Status de aprovaÃ§Ã£o"]}
    />
  );
}
