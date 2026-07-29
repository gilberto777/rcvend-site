import { Building2, Clock3, MapPinned, MessageCircle, Scale, UserRoundCheck } from "lucide-react";

const benefits = [
  {
    icon: Scale,
    title: "Compare imóveis com mais clareza",
    text: "Veja preço, metragem, dormitórios, vagas e diferenciais em cards pensados para comparação rápida.",
  },
  {
    icon: MapPinned,
    title: "Encontre oportunidades por bairro",
    text: "Explore regiões estratégicas e encontre imóveis alinhados com rotina, mobilidade e objetivo de compra.",
  },
  {
    icon: MessageCircle,
    title: "Receba atendimento pelo WhatsApp",
    text: "Fale com um especialista quando encontrar uma oportunidade interessante ou quiser ajuda na busca.",
  },
  {
    icon: Building2,
    title: "Veja lançamentos e imóveis prontos",
    text: "Compare empreendimentos em lançamento, unidades prontas para morar e oportunidades para investir.",
  },
  {
    icon: Clock3,
    title: "Economize tempo na busca",
    text: "Comece por critérios importantes e evite navegar por anúncios que não combinam com seu perfil.",
  },
  {
    icon: UserRoundCheck,
    title: "Tenha apoio de especialista",
    text: "Conte com atendimento consultivo para entender regiões, tipos de imóvel e próximos passos.",
  },
];

export function BenefitsSection() {
  return (
    <section className="container-page py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Benefícios</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Uma jornada mais simples para escolher seu próximo imóvel.</h2>
        <p className="mt-4 leading-7 text-muted">
          O RC Vend organiza a busca para ajudar compradores, locatários e investidores a comparar melhor e agir no momento certo.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg">
            <benefit.icon className="h-8 w-8 text-brand" />
            <h3 className="mt-4 text-lg font-black">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{benefit.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
