import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type PropertyAiResponse = {
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  highlights: string[];
  card_callout: string;
  whatsapp_message: string;
  instagram_caption: string;
  google_ads_headlines: string[];
  google_ads_descriptions: string[];
  seo_keywords: string[];
  slug_suggestion: string;
};

type PropertyAiInput = {
  enterpriseName: string;
  neighborhood?: string;
  city?: string;
  type?: string;
  purpose?: string;
  price?: string;
  area?: string;
  bedrooms?: string;
  bathrooms?: string;
  suites?: string;
  parking_spaces?: string;
  characteristics?: string[];
  audience?: string;
  differentiators?: string;
  tone?: string;
};

const typeLabels: Record<string, string> = {
  studio: "studio",
  apartment: "apartamento",
  house: "casa",
  penthouse: "cobertura",
  commercial: "imovel comercial",
  land: "terreno",
};

const purposeLabels: Record<string, string> = {
  sale: "venda",
  rent: "locacao",
  launch: "lancamento",
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 600) : "";
}

function cleanList(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.map((item) => cleanString(item)).filter(Boolean).slice(0, 16);
}

function normalizeInput(body: unknown): PropertyAiInput {
  const source = typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  return {
    enterpriseName: cleanString(source.enterpriseName),
    neighborhood: cleanString(source.neighborhood),
    city: cleanString(source.city),
    type: cleanString(source.type),
    purpose: cleanString(source.purpose),
    price: cleanString(source.price),
    area: cleanString(source.area),
    bedrooms: cleanString(source.bedrooms),
    bathrooms: cleanString(source.bathrooms),
    suites: cleanString(source.suites),
    parking_spaces: cleanString(source.parking_spaces),
    characteristics: cleanList(source.characteristics),
    audience: cleanString(source.audience),
    differentiators: cleanString(source.differentiators),
    tone: cleanString(source.tone),
  };
}

function slugifySuggestion(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function localSuggestion(input: PropertyAiInput): PropertyAiResponse {
  const enterpriseName = input.enterpriseName;
  const cleanName = enterpriseName.trim();
  const normalizedName = cleanName
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const lowerName = normalizedName.toLowerCase();
  const neighborhood = input.neighborhood || (lowerName.includes("brooklin") ? "Brooklin" : lowerName.includes("moema") ? "Moema" : "");
  const city = input.city || "Sao Paulo";
  const hasBrooklin = lowerName.includes("brooklin") || neighborhood.toLowerCase().includes("brooklin");
  const hasMoema = lowerName.includes("moema") || neighborhood.toLowerCase().includes("moema");
  const hasStudio = lowerName.includes("studio") || lowerName.includes("studios") || lowerName.includes("zip");
  const region = neighborhood ? `em ${neighborhood}` : hasBrooklin ? "no Brooklin" : hasMoema ? "em Moema" : `em ${city}`;
  const propertyType = typeLabels[input.type ?? ""] ?? (hasStudio ? "studio" : "apartamento");
  const purpose = purposeLabels[input.purpose ?? ""] ?? "venda";
  const profile = hasStudio || propertyType === "studio" ? "studios e apartamentos compactos" : `${propertyType}s com proposta residencial contemporanea`;
  const title = `${normalizedName}: ${profile} ${region}`;
  const detailLine = [
    input.area ? `${input.area} m2` : "",
    input.bedrooms && input.bedrooms !== "0" ? `${input.bedrooms} dormitorio(s)` : propertyType === "studio" ? "planta compacta" : "",
    input.parking_spaces && input.parking_spaces !== "0" ? `${input.parking_spaces} vaga(s)` : "",
  ].filter(Boolean).join(", ");
  const description = [
    `${normalizedName} e uma oportunidade de ${purpose} ${region}, pensada para quem busca boa localizacao, clareza na comparacao e uma experiencia de escolha mais segura.`,
    detailLine ? `O cadastro indica ${detailLine}, com informacoes organizadas para facilitar a analise antes do contato.` : `O anuncio pode ganhar ainda mais forca quando metragem, valores, lazer, prazo de entrega e diferenciais reais forem preenchidos.`,
    `Com ${profile}, o projeto pode atender tanto clientes que procuram o primeiro imovel quanto investidores atentos a regioes com demanda consistente.`,
  ].join(" ");
  const highlights = [
    `Oportunidade ${region}`,
    "Informacoes organizadas para comparacao",
    "Atendimento direto pelo RC Vend",
    ...(input.characteristics ?? []).slice(0, 3),
  ];

  return {
    title,
    description,
    meta_title: title,
    meta_description: description.slice(0, 155),
    highlights,
    card_callout: `${normalizedName} ${region}: compare detalhes e fale com um especialista.`,
    whatsapp_message: `Ola! Tenho interesse em saber mais sobre ${normalizedName} ${region}. Pode me enviar detalhes?`,
    instagram_caption: `${normalizedName} ${region}. Uma opcao para quem quer comparar imoveis com mais clareza e receber atendimento direto pelo RC Vend.`,
    google_ads_headlines: [`${normalizedName} ${region}`.slice(0, 30), `Imovel ${region}`.slice(0, 30), "Fale Pelo WhatsApp"],
    google_ads_descriptions: [
      `Compare detalhes de ${normalizedName} e fale com um especialista pelo RC Vend.`.slice(0, 90),
      `Imoveis selecionados em Sao Paulo com atendimento direto e cadastro claro.`.slice(0, 90),
    ],
    seo_keywords: [normalizedName, neighborhood, city, propertyType, purpose, "RC Vend"].filter(Boolean),
    slug_suggestion: slugifySuggestion(`${normalizedName} ${region}`),
  };
}

function extractText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";
  if ("output_text" in data && typeof data.output_text === "string") return data.output_text;

  const output = "output" in data && Array.isArray(data.output) ? data.output : [];
  return output
    .flatMap((item) => (typeof item === "object" && item && "content" in item && Array.isArray(item.content) ? item.content : []))
    .map((content) => {
      if (typeof content !== "object" || content === null) return "";
      if ("text" in content && typeof content.text === "string") return content.text;
      return "";
    })
    .join("\n");
}

async function assertAdmin(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authHeader = request.headers.get("authorization");

  if (!supabaseUrl || !supabaseAnonKey || !authHeader) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", userData.user.id)
    .single();

  return profile?.role === "admin" && profile?.status === "active";
}

export async function POST(request: Request) {
  const isAdmin = await assertAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const input = normalizeInput(body);
  const enterpriseName = input.enterpriseName;

  if (enterpriseName.length < 3) {
    return NextResponse.json({ error: "Informe o nome do empreendimento." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ...localSuggestion(input), mode: "no_key" });
  }

  const fallback = localSuggestion(input);
  const schema = {
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "description",
      "meta_title",
      "meta_description",
      "highlights",
      "card_callout",
      "whatsapp_message",
      "instagram_caption",
      "google_ads_headlines",
      "google_ads_descriptions",
      "seo_keywords",
      "slug_suggestion",
    ],
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      meta_title: { type: "string" },
      meta_description: { type: "string" },
      highlights: { type: "array", minItems: 4, maxItems: 8, items: { type: "string" } },
      card_callout: { type: "string" },
      whatsapp_message: { type: "string" },
      instagram_caption: { type: "string" },
      google_ads_headlines: { type: "array", minItems: 3, maxItems: 8, items: { type: "string" } },
      google_ads_descriptions: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
      seo_keywords: { type: "array", minItems: 5, maxItems: 14, items: { type: "string" } },
      slug_suggestion: { type: "string" },
    },
  };

  const buildPayload = (model: string) => ({
      model,
      text: {
        format: {
          type: "json_schema",
          name: "rcvend_property_ad",
          strict: true,
          schema,
        },
      },
      input: [
        {
          role: "system",
          content:
            "Voce e um copywriter senior de portal imobiliario brasileiro especializado em Sao Paulo. Crie anuncios premium, objetivos, confiaveis e prontos para conversao. Responda somente JSON valido no schema solicitado.",
        },
        {
          role: "user",
          content: `Crie um pacote completo de anuncio imobiliario para o RC Vend com estes dados:
${JSON.stringify(input, null, 2)}

Regras:
- Use portugues do Brasil, tom premium e consultivo.
- Use a localizacao, metragem, preco, quartos, vagas e lazer somente quando estiverem nos dados enviados.
- Nao invente prazo de entrega, construtora, numero de torres, quantidade de unidades, rentabilidade, valorizacao garantida ou promessa juridica.
- Se faltar dado, escreva de forma comercial sem parecer incompleto.
- Foque em clareza, comparacao, bairro, decisao segura e contato pelo WhatsApp.
- Nao prometa valorizacao, rentabilidade ou ganho garantido.
- Title: ate 80 caracteres, forte e comercial.
- Description: 2 a 3 paragrafos curtos em um unico texto, com linguagem de portal imobiliario. Pode usar HTML simples com <p>, <strong> e <ul><li> quando fizer sentido.
- Meta title: ate 60 caracteres.
- Meta description: ate 155 caracteres.
- Highlights: frases curtas, reais e vendaveis.
- Google Ads headlines: ate 30 caracteres cada.
- Google Ads descriptions: ate 90 caracteres cada.
- Slug: curto, sem acentos, em minusculas e com hifens.
- Sem markdown e sem texto fora do JSON.`,
        },
      ],
  });

  const requestedModel = process.env.OPENAI_MODEL?.trim();
  const models = Array.from(new Set([requestedModel || "gpt-4o-mini", "gpt-4.1-mini"].filter(Boolean)));
  let response: Response | null = null;
  let failedText = "";
  let failedModel = "";

  for (const model of models) {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildPayload(model)),
    });

    if (response.ok) break;

    failedModel = model;
    failedText = await response.text().catch(() => "");
    if (![400, 404].includes(response.status)) break;
  }

  if (!response?.ok) {
    let errorMessage = "";
    let errorCode = "";
    try {
      const parsed = JSON.parse(failedText) as { error?: { message?: string; code?: string } };
      errorMessage = parsed.error?.message ?? "";
      errorCode = parsed.error?.code ?? "";
    } catch {}
    console.warn("OpenAI property-ai generation failed", {
      model: failedModel,
      status: response?.status,
      statusText: response?.statusText,
      code: errorCode,
      body: failedText.slice(0, 500),
    });
    return NextResponse.json({
      ...fallback,
      mode: "openai_error",
      openai_status: response?.status ?? 0,
      openai_code: errorCode,
      openai_message: errorMessage.slice(0, 180),
    });
  }

  const data = await response.json();
  const rawText = extractText(data).trim();
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  try {
    const parsed = JSON.parse(jsonText) as Partial<PropertyAiResponse>;
    return NextResponse.json({
      title: parsed.title || fallback.title,
      description: parsed.description || fallback.description,
      meta_title: parsed.meta_title || parsed.title || fallback.meta_title,
      meta_description: parsed.meta_description || parsed.description || fallback.meta_description,
      highlights: parsed.highlights?.length ? parsed.highlights : fallback.highlights,
      card_callout: parsed.card_callout || fallback.card_callout,
      whatsapp_message: parsed.whatsapp_message || fallback.whatsapp_message,
      instagram_caption: parsed.instagram_caption || fallback.instagram_caption,
      google_ads_headlines: parsed.google_ads_headlines?.length ? parsed.google_ads_headlines : fallback.google_ads_headlines,
      google_ads_descriptions: parsed.google_ads_descriptions?.length ? parsed.google_ads_descriptions : fallback.google_ads_descriptions,
      seo_keywords: parsed.seo_keywords?.length ? parsed.seo_keywords : fallback.seo_keywords,
      slug_suggestion: parsed.slug_suggestion || fallback.slug_suggestion,
      mode: "openai",
    });
  } catch {
    return NextResponse.json({ ...fallback, mode: "parse_error" });
  }
}
