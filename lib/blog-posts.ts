export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  image: string;
  imageAlt: string;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "como-escolher-o-melhor-bairro-para-morar-em-sao-paulo",
    title: "Como escolher o melhor bairro para morar em São Paulo",
    excerpt: "Veja critérios práticos para comparar localização, mobilidade, rotina, serviços e potencial de valorização.",
    category: "Bairros",
    readTime: "4 min",
    publishedAt: "2026-06-13",
    image: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vista urbana de São Paulo com prédios residenciais",
    body: [
      "Escolher um bairro não é apenas escolher um endereço. A decisão envolve rotina, tempo de deslocamento, acesso a serviços, segurança percebida, perfil das ruas e oferta de imóveis dentro da faixa desejada.",
      "Antes de comparar apartamentos ou casas, vale listar o que pesa mais para você: proximidade do trabalho, escolas, metrô, parques, comércio, vida noturna ou tranquilidade. Essa ordem ajuda a evitar visitas que parecem boas no anúncio, mas não combinam com o dia a dia.",
      "Também é importante observar o momento do bairro. Regiões com novos empreendimentos, melhorias de mobilidade e boa oferta de serviços podem apresentar oportunidades interessantes para morar ou investir.",
    ],
  },
  {
    slug: "lancamento-ou-imovel-pronto-o-que-comparar-antes-de-decidir",
    title: "Lançamento ou imóvel pronto: o que comparar antes de decidir",
    excerpt: "Entenda diferenças de prazo, personalização, pagamento, localização e risco para escolher com mais clareza.",
    category: "Compra",
    readTime: "5 min",
    publishedAt: "2026-06-13",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Interior moderno de apartamento pronto para morar",
    body: [
      "Lançamentos e imóveis prontos atendem momentos diferentes. O lançamento pode oferecer fluxo de pagamento durante a obra e possibilidade de escolha de planta, enquanto o pronto permite visitar, medir ambientes e mudar em menos tempo.",
      "Na comparação, olhe além do preço anunciado. Considere prazo de entrega, custos adicionais, taxa condominial estimada, padrão de acabamento, vagas, lazer, insolação e liquidez da região.",
      "Para quem compra para investir, vale comparar demanda de locação, perfil do público da região e oferta concorrente. Para moradia, a prioridade costuma estar na rotina e na previsibilidade da entrega.",
    ],
  },
  {
    slug: "checklist-para-visitar-um-imovel-com-mais-seguranca",
    title: "Checklist para visitar um imóvel com mais segurança",
    excerpt: "Uma lista simples para avaliar planta, iluminação, conservação, ruído, condomínio e entorno durante a visita.",
    category: "Guia prático",
    readTime: "3 min",
    publishedAt: "2026-06-13",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Sala residencial iluminada durante visita de imóvel",
    body: [
      "Uma visita produtiva começa antes de chegar ao imóvel. Confirme endereço, metragem, número de vagas, valor de condomínio, IPTU, regras do edifício e disponibilidade real da unidade.",
      "Durante a visita, observe iluminação natural, ventilação, estado de pisos e paredes, pressão da água, posição das tomadas, ruído da rua e qualidade das áreas comuns.",
      "Depois, compare suas anotações com outros imóveis vistos. Decisões melhores aparecem quando as oportunidades ficam lado a lado, com critérios parecidos.",
    ],
  },
  {
    slug: "amortizacao-de-financiamento-imobiliario-como-reduzir-prazo-ou-parcela",
    title: "Amortização de financiamento imobiliário: como reduzir prazo ou parcela",
    excerpt: "Veja um passo a passo para usar aportes extras, FGTS quando permitido e simulações para diminuir juros, encurtar o financiamento ou aliviar a parcela.",
    category: "Financiamento",
    readTime: "6 min",
    publishedAt: "2026-06-13",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Pessoa analisando documentos financeiros e calculadora",
    body: [
      "Amortizar um financiamento imobiliário significa pagar uma parte extra do saldo devedor antes do prazo original. Na prática, esse pagamento antecipado pode reduzir o prazo total do contrato ou o valor das parcelas futuras.",
      "A escolha entre reduzir prazo ou parcela depende do objetivo. Quem quer pagar menos juros no total costuma priorizar a redução do prazo, porque a dívida fica ativa por menos tempo. Quem precisa de fôlego no orçamento pode preferir reduzir a parcela mensal.",
      "O primeiro passo é consultar o saldo devedor atualizado no banco. Depois, peça ou gere uma simulação comparando as duas alternativas: amortizar no prazo e amortizar na prestação. Compare o novo número de parcelas, o novo valor mensal e a economia total estimada de juros.",
      "Em seguida, defina a fonte do aporte. Pode ser uma reserva planejada, décimo terceiro, bônus, venda de algum bem ou FGTS, quando o contrato e as regras vigentes permitirem. Antes de usar toda a reserva, mantenha uma margem de segurança para emergências.",
      "Com a simulação em mãos, escolha a estratégia. Se a parcela cabe bem no orçamento e o objetivo é quitar mais rápido, reduzir prazo tende a ser mais eficiente. Se a parcela está pesada, reduzir a prestação pode trazer mais equilíbrio financeiro.",
      "Depois de pagar o boleto ou solicitar a amortização pelo canal do banco, confira o extrato do contrato. Verifique se o saldo devedor caiu, se o prazo ou a parcela foram atualizados e guarde o comprovante da operação.",
      "É possível que uma estratégia disciplinada de amortizações reduza muito um financiamento longo. Em alguns cenários, um contrato de 30 anos pode cair para poucos anos, até menos de 5, mas isso não é uma regra. O resultado depende das condições do contrato e dos aportes.",
      "Antes de decidir, faça as contas e compare com outras prioridades financeiras. A amortização pode ser poderosa, mas deve caminhar junto com reserva de emergência, organização do orçamento e análise das condições do contrato.",
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}
