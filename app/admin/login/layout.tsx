import { ToastProvider } from "@/components/ToastContext";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // Login page não precisa de autenticação
  // A verificação de admin está em app/admin/layout.tsx
  
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
