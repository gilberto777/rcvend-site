// Layout raiz de /admin
// Autenticação acontece em (protected)/layout.tsx
// As rotas de login não precisam de autenticação

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

