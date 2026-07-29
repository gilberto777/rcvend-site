import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function AdminDevelopersPage() {
  return (
    <AdminPlaceholder
      title="Construtoras"
      description="GestÃ£o de construtoras, incorporadoras, empreendimentos, materiais comerciais e lanÃ§amentos vinculados."
      entityLabel="construtora"
      actionHref="/admin/construtoras/novo"
      fields={["Empresa", "CNPJ", "ResponsÃ¡vel", "WhatsApp", "Empreendimentos", "Status de aprovaÃ§Ã£o"]}
    />
  );
}
