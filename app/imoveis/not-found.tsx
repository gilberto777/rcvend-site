import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Imóvel não encontrado | RC Vend",
  description: "O imóvel que você procura não foi encontrado. Volte à busca e explore outras oportunidades.",
};

export default function PropertyNotFoundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-surface p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.18em] text-brand">
            RC Vend
          </Link>
          <Link href="/" className="text-sm font-black text-muted transition-colors hover:text-brand">
            Home
          </Link>
        </div>

        <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-amber-100 p-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-brand-strong md:text-4xl">Imóvel não encontrado</h1>

          <p className="mt-4 text-muted">
            Desculpe, o imóvel solicitado não existe em nossa base de dados.
          </p>

          <p className="mt-3 text-sm text-muted">
            Ele pode ter sido removido, o link pode estar desatualizado ou houve um erro na URL.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/imoveis"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 font-black text-white transition-colors hover:bg-brand-strong"
            >
              <Home className="h-4 w-4" />
              Ver todos os imóveis
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand px-6 py-3 font-black text-brand transition-colors hover:bg-brand/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para home
            </Link>
          </div>

          <div className="mt-12 border-t border-line pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Sugestões</p>

            <ul className="mt-4 space-y-2 text-left text-sm text-muted">
              <li>
                Use a{" "}
                <Link href="/imoveis" className="font-black text-brand hover:underline">
                  busca de imóveis
                </Link>{" "}
                para encontrar propriedades.
              </li>
              <li>
                Explore{" "}
                <Link href="/imoveis/sao-paulo" className="font-black text-brand hover:underline">
                  imóveis por bairro
                </Link>
                .
              </li>
              <li>
                Confira os{" "}
                <Link href="/lancamentos/sao-paulo" className="font-black text-brand hover:underline">
                  lançamentos
                </Link>{" "}
                disponíveis.
              </li>
              <li>
                Entre em contato via{" "}
                <a href="https://wa.me/5511970259728" target="_blank" rel="noopener noreferrer" className="font-black text-brand hover:underline">
                  WhatsApp
                </a>
                .
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
