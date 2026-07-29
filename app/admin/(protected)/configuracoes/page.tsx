import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholder
      title="Configurações"
      description="Preferências do portal, identidade visual, canais de contato, integrações, SEO global e regras operacionais."
      entityLabel="configuração"
      fields={["Identidade do portal", "WhatsApp comercial", "E-mail", "SEO global", "Integrações", "Publicação"]}
    />
  );
}
