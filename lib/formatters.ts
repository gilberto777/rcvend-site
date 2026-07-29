export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatStartingPrice(value: number) {
  return `A partir de ${formatCurrency(value)}`;
}

export function formatPropertyPrice(property: {
  price: number;
  purpose: "sale" | "rent" | "launch";
  is_launch?: boolean;
}) {
  if (property.purpose === "rent") return `${formatCurrency(property.price)}/mês`;
  if (property.purpose === "launch" || property.is_launch) return formatStartingPrice(property.price);
  return formatCurrency(property.price);
}

export function formatArea(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} m²`;
}

export function formatDisplayText(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bChacara Santo Antonio\b/gi, "Chácara Santo Antônio"],
    [/\bSao Paulo\b/gi, "São Paulo"],
    [/\bLancamentos\b/g, "Lançamentos"],
    [/\blancamentos\b/g, "lançamentos"],
    [/\bLancamento\b/g, "Lançamento"],
    [/\blancamento\b/g, "lançamento"],
    [/\bImoveis\b/g, "Imóveis"],
    [/\bimoveis\b/g, "imóveis"],
    [/\bImovel\b/g, "Imóvel"],
    [/\bimovel\b/g, "imóvel"],
    [/\bParaiso\b/g, "Paraíso"],
    [/\bcondominio\b/gi, "condomínio"],
    [/\bpublicacao\b/gi, "publicação"],
    [/\bregiao\b/gi, "região"],
    [/\bregioes\b/gi, "regiões"],
    [/\binformacoes\b/gi, "informações"],
    [/\bconfiguracoes\b/gi, "configurações"],
    [/\blocalizacao\b/gi, "localização"],
    [/\bdisponiveis\b/gi, "disponíveis"],
    [/\bservicos\b/gi, "serviços"],
    [/\bNao informado\b/g, "Não informado"],
  ];

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getWhatsAppUrl(message: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511970259728";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
