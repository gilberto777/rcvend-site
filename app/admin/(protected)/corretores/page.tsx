import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function AdminAgentsPage() {
  return (
    <AdminPlaceholder
      title="Corretores"
      description="Gestão de perfis, CRECI, contatos, status de aprovação e carteira de imóveis vinculada."
      entityLabel="corretor"
      actionHref="/admin/corretores/novo"
      fields={["Nome", "CRECI", "WhatsApp", "E-mail", "Cidade de atuação", "Status de aprovação"]}
    />
  );
}
