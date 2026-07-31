import Image from "next/image";
import Link from "next/link";
import { MapPinned, Menu, MessageCircle, Search, X } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/formatters";

const navItems = [
  { href: "/imoveis?purpose=sale", label: "Comprar" },
  { href: "/imoveis?purpose=rent", label: "Alugar" },
  { href: "/imoveis?purpose=launch", label: "Lançamentos" },
  { href: "/#bairros", label: "Bairros" },
  { href: "/blog", label: "Blog" },
  { href: "/anuncie", label: "Anuncie grátis" },
  { href: "/admin/login", label: "Entrar" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(0,38,83,0.96)] text-[#EAF6FF] shadow-[0_12px_30px_rgba(0,20,48,0.22)] backdrop-blur-md">
      <div className="container-page flex min-h-18 items-center justify-between gap-3 py-3 lg:gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 lg:shrink-0 lg:gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white p-1.5 shadow-sm sm:h-12 sm:w-12">
            <Image src="/logo-rcvend.png" alt="RC Vend" width={48} height={48} className="h-full w-full object-contain" priority />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-black tracking-tight text-white">RC Vend</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[#58C0FF] sm:block">Portal Imobiliário Inteligente</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-[#EAF6FF] transition hover:text-[#58C0FF]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/mapa#mapa"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-black text-[#EAF6FF] transition hover:border-[#58C0FF]/60 hover:bg-white/10 hover:text-[#58C0FF]"
          >
            <MapPinned className="h-4 w-4" />
            Mapa
          </Link>
          <Link
            href="/imoveis"
            aria-label="Buscar imóvel"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-[#EAF6FF] transition hover:border-[#58C0FF]/60 hover:bg-white/10 hover:text-[#58C0FF]"
          >
            <Search className="h-5 w-5" />
          </Link>
          <a
            href={getWhatsAppUrl("Olá! Vim pelo RC Vend e gostaria de falar com um especialista.")}
            className="inline-flex items-center gap-2 rounded-full bg-[#159FE8] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#36B4F5]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Link
            href="/imoveis"
            aria-label="Buscar imóvel"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-[#EAF6FF] transition hover:border-[#58C0FF]/60 hover:bg-white/10 hover:text-[#58C0FF]"
          >
            <Search className="h-5 w-5" />
          </Link>
          <a
            href={getWhatsAppUrl("Olá! Vim pelo RC Vend e gostaria de falar com um especialista.")}
            aria-label="Falar pelo WhatsApp"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#159FE8] text-white shadow-sm transition hover:bg-[#36B4F5]"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <details className="group relative">
            <summary
              aria-label="Abrir menu de navegação"
              className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border border-white/20 bg-white/5 text-[#EAF6FF] transition hover:border-[#58C0FF]/60 hover:bg-white/10 hover:text-[#58C0FF] [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-5 w-5 group-open:hidden" />
              <X className="hidden h-5 w-5 group-open:block" />
            </summary>
            <nav className="absolute right-0 top-[calc(100%+0.75rem)] z-50 grid w-[min(19rem,calc(100vw-2rem))] gap-1 rounded-2xl border border-white/12 bg-brand-strong p-2 text-sm font-bold shadow-2xl shadow-black/30">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 text-[#EAF6FF] transition hover:bg-white/10 hover:text-[#58C0FF]">
                  {item.label}
                </Link>
              ))}
              <Link href="/mapa#mapa" className="flex items-center gap-2 rounded-xl px-4 py-3 text-[#EAF6FF] transition hover:bg-white/10 hover:text-[#58C0FF]">
                <MapPinned className="h-4 w-4" />
                Mapa
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
