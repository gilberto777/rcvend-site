import Image from "next/image";
import Link from "next/link";
import { MapPinned, MessageCircle, Search } from "lucide-react";
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
      <div className="container-page flex min-h-18 flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 lg:flex-nowrap lg:gap-x-6">
        <Link href="/" className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white p-1.5 shadow-sm">
            <Image src="/logo-rcvend.png" alt="RC Vend" width={48} height={48} className="h-full w-full object-contain" priority />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-white">RC Vend</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#58C0FF]">Portal Imobiliário Inteligente</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-4 overflow-x-auto text-sm font-semibold lg:order-2 lg:w-auto lg:gap-5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-[#EAF6FF] transition hover:text-[#58C0FF]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-2 lg:order-3">
          <Link
            href="/mapa#mapa"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-black text-[#EAF6FF] transition hover:border-[#58C0FF]/60 hover:bg-white/10 hover:text-[#58C0FF] sm:inline-flex"
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
      </div>
    </header>
  );
}
