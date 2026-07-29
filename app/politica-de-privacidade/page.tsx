import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Politica de privacidade",
  description: "Politica de privacidade do RC Vend sobre dados de contato, leads e navegacao no portal.",
  alternates: { canonical: "/politica-de-privacidade" },
};

const sections = [
  {
    title: "Dados coletados",
    text: "Podemos coletar dados enviados voluntariamente em formulários, como nome, WhatsApp, e-mail, perfil de interesse, mensagem e imóvel relacionado.",
  },
  {
    title: "Uso das informações",
    text: "As informações podem ser usadas para atendimento comercial, retorno sobre imóveis, organização de leads e melhoria da experiência do portal.",
  },
  {
    title: "Compartilhamento",
    text: "Dados podem ser compartilhados com parceiros envolvidos no atendimento quando necessario para responder ao interesse do usuario.",
  },
  {
    title: "Seguranca",
    text: "O RC Vend busca adotar boas praticas para proteger dados, limitar acessos administrativos e manter registros organizados.",
  },
  {
    title: "Solicitacoes",
    text: "O titular pode solicitar revisao, atualizacao ou remocao de dados pelos canais de contato informados no portal.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Privacidade</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">Politica de privacidade</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Esta página resume como o RC Vend trata informações enviadas por usuários e interessados.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-3xl border border-line bg-white p-7 shadow-sm md:p-10">
          <div className="grid gap-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-black">{section.title}</h2>
                <p className="mt-3 leading-8 text-muted">{section.text}</p>
              </section>
            ))}
          </div>
          <p className="mt-10 rounded-2xl bg-background p-5 text-sm leading-6 text-muted">
            Esta politica podera ser atualizada conforme o portal evoluir, novos recursos forem adicionados e novos canais de atendimento forem disponibilizados.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
