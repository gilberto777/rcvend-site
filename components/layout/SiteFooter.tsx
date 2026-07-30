import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/formatters";

const neighborhoodLinks = [
  { href: "/imoveis/sao-paulo/brooklin", label: "Brooklin" },
  { href: "/imoveis/sao-paulo/moema", label: "Moema" },
  { href: "/imoveis?q=Vila%20Mariana", label: "Vila Mariana" },
  { href: "/imoveis?q=Paraiso", label: "Paraíso" },
  { href: "/imoveis?q=Chacara%20Santo%20Antonio", label: "Chácara Santo Antônio" },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-strong text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo-rcvend-white.png" alt="RC Vend" width={72} height={72} className="h-16 w-16 object-contain" />
            <p className="text-2xl font-black">RC Vend</p>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/68">
            Portal imobiliário inteligente para buscar, comparar e encontrar oportunidades de compra, locação e lançamentos em São Paulo.
          </p>
          <a
            href={getWhatsAppUrl("Ola! Vim pelo RC Vend e gostaria de atendimento.")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-black text-brand-strong transition hover:bg-white"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <div>
          <p className="font-semibold">Imóveis</p>
          <div className="mt-3 grid gap-2 text-sm text-white/68">
            <Link href="/imoveis?purpose=sale">Comprar</Link>
            <Link href="/imoveis?purpose=rent">Alugar</Link>
            <Link href="/imoveis?purpose=launch">Lançamentos</Link>
            <Link href="/imoveis">Todos os imóveis</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold">Bairros</p>
          <div className="mt-3 grid gap-2 text-sm text-white/68">
            {neighborhoodLinks.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold">Portal</p>
          <div className="mt-3 grid gap-2 text-sm text-white/68">
            <Link href="/blog">Blog RC Vend</Link>
            <Link href="/anuncie">Anuncie</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/politica-de-privacidade">Política de privacidade</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold">Contato</p>
          <p className="mt-3 text-sm leading-6 text-white/68">
            rcvend.com.br
            <br />
            ralf.imoveis8@gmail.com
            <br />
            Atendimento comercial via WhatsApp
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page text-xs text-white/52">2026 RC Vend. Portal imobiliário inteligente.</div>
      </div>
    </footer>
  );
}
