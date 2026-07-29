import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ToastContext";
import { checkAdminAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // Verificar autenticação server-side APENAS para rotas protegidas
  // /admin/login NÃO passa por este layout (está em grupo separado)
  await checkAdminAuth();

  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
