"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronRight,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Settings,
  Smartphone,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";

type AdminShellProps = {
  children: React.ReactNode;
};

type AdminProfile = {
  full_name: string | null;
  email: string | null;
  role: string;
};

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/imoveis/novo", label: "Novo imóvel", icon: Home },
  { href: "/admin/leads", label: "Leads", icon: BarChart3 },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/preview-mobile", label: "Prévia mobile", icon: Smartphone },
  { href: "/admin/corretores", label: "Corretores", icon: UserRound },
  { href: "/admin/imobiliarias", label: "Imobiliárias", icon: UsersRound },
  { href: "/admin/construtoras", label: "Construtoras", icon: Building2 },
  { href: "/admin/bairros", label: "Bairros", icon: MapPinned },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(!isLogin);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const pageTitle = useMemo(() => {
    return navItems.find((item) => isActive(pathname, item.href))?.label ?? "Admin";
  }, [pathname]);

  // Carregar perfil do usuário autenticado
  useEffect(() => {
    if (isLogin) {
      return;
    }

    async function loadProfile() {
      try {
        const supabase = createSupabaseClient();
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name,
            email: data.email ?? user.email ?? null,
            role: data.role,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [isLogin]);

  if (isLogin) return <>{children}</>;

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6">
        <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">RC Vend Admin</p>
          <h1 className="mt-2 text-2xl font-black">Carregando</h1>
          <p className="mt-2 text-sm text-muted">Seu painel está sendo preparado.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-brand-strong text-white lg:block">
        <div className="flex h-full flex-col">
          <Link href="/admin" className="flex items-center gap-3 px-6 py-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/45 bg-white/8 text-sm font-black text-white">VM</span>
            <span>
              <span className="block text-lg font-black">RC Vend</span>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin portal</span>
            </span>
          </Link>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active ? "bg-accent text-brand-strong" : "text-white/78 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <form action="/auth/logout" method="POST">
              <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/78 transition hover:bg-white/8 hover:text-white">
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-line bg-white/92 backdrop-blur">
          <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-line text-brand lg:hidden"
                aria-label="Abrir menu administrativo"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Painel administrativo</p>
                <h1 className="text-xl font-black md:text-2xl">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-black">{profile?.full_name ?? "Administrador"}</p>
                <p className="text-xs text-muted">{profile?.email ?? "admin@rcvend.com.br"}</p>
              </div>
              <form action="/auth/logout" method="POST">
                <button type="submit" className="hidden rounded-2xl border border-line px-4 py-3 text-sm font-black text-brand hover:border-brand sm:inline-flex">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/40" aria-label="Fechar menu" onClick={() => setIsOpen(false)} />
          <aside className="relative flex h-full w-[min(320px,88vw)] flex-col bg-brand-strong p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/45 bg-white/8 text-sm font-black">VM</span>
                <span className="font-black">RC Vend</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-white/82 hover:bg-white/8"
                  >
                    <span className="flex items-center gap-3"><Icon className="h-5 w-5" />{item.label}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
