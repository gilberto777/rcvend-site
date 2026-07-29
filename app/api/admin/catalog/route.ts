import { NextResponse } from "next/server";
import { adminCatalogConfigs, type AdminCatalogKind } from "@/lib/admin/catalog";
import { slugify } from "@/lib/formatters";
import { createSupabaseServiceRoleClient, createSupabaseServerClient } from "@/lib/supabase/server";

type CatalogPayload = Record<string, string>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const text = cleanText(value);
  return text.length ? text : null;
}

function parseBoolean(value: unknown, fallback = true) {
  const text = cleanText(value);
  if (!text) return fallback;
  return text === "true";
}

function parseDateTime(value: unknown) {
  const text = cleanText(value);
  if (!text) return null;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Informe uma data de publicação válida.");
  }

  return parsed.toISOString();
}

function isAdminCatalogKind(value: unknown): value is AdminCatalogKind {
  return typeof value === "string" && value in adminCatalogConfigs;
}

async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Você precisa entrar novamente no admin." }, { status: 401 }) } as const;
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role, status").eq("id", user.id).single();

  if (profileError || !profile || profile.role !== "admin" || profile.status !== "active") {
    return { error: NextResponse.json({ error: "Sem permissão para executar esta ação." }, { status: 403 }) } as const;
  }

  return { supabase, user } as const;
}

export async function POST(request: Request) {
  let body: { kind?: unknown; data?: unknown } | undefined;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!isAdminCatalogKind(body?.kind)) {
    return NextResponse.json({ error: "Tipo de cadastro inválido." }, { status: 400 });
  }

  const kind = body?.kind as AdminCatalogKind;
  const adminContext = await requireAdminUser();
  if ("error" in adminContext) {
    return adminContext.error;
  }

  const service = createSupabaseServiceRoleClient();
  const rawData = body?.data;
  const data = (typeof rawData === "object" && rawData !== null ? rawData : {}) as CatalogPayload;

  try {
    switch (kind) {
      case "corretor": {
        const email = cleanText(data.email);
        if (!email) {
          return NextResponse.json({ error: "Informe o e-mail do corretor." }, { status: 400 });
        }

        const fullName = optionalText(data.full_name);
        const phone = optionalText(data.phone);
        const whatsapp = optionalText(data.whatsapp);
        const creci = optionalText(data.creci);

        const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
          data: fullName ? { full_name: fullName } : undefined,
        });

        if (inviteError) {
          throw inviteError;
        }

        const userId = inviteData.user?.id;
        if (!userId) {
          throw new Error("Não foi possível criar o convite do corretor.");
        }

        const profilePayload = {
          full_name: fullName,
          email,
          phone,
          whatsapp,
          creci,
        };

        const { data: existingProfile, error: lookupError } = await service.from("profiles").select("id").eq("id", userId).maybeSingle();
        if (lookupError) {
          throw lookupError;
        }

        if (existingProfile) {
          const { error: updateError } = await service.from("profiles").update(profilePayload).eq("id", userId);
          if (updateError) {
            throw updateError;
          }
        } else {
          const { error: insertError } = await service.from("profiles").insert({
            id: userId,
            ...profilePayload,
            role: "agent",
            status: "pending",
          });
          if (insertError) {
            throw insertError;
          }
        }

        return NextResponse.json({ ok: true, message: adminCatalogConfigs.corretor.successMessage });
      }

      case "imobiliaria": {
        const name = cleanText(data.name);
        if (!name) {
          return NextResponse.json({ error: "Informe o nome da imobiliária." }, { status: 400 });
        }

        const { error } = await service.from("organizations").insert({
          name,
          slug: cleanText(data.slug) || slugify(name),
          type: "agency",
          phone: optionalText(data.phone),
          whatsapp: optionalText(data.whatsapp),
          email: optionalText(data.email),
          website: optionalText(data.website),
          city: optionalText(data.city) || "São Paulo",
          state: optionalText(data.state) || "SP",
          status: cleanText(data.status) || "pending",
        });

        if (error) {
          throw error;
        }

        return NextResponse.json({ ok: true, message: adminCatalogConfigs.imobiliaria.successMessage });
      }

      case "construtora": {
        const name = cleanText(data.name);
        if (!name) {
          return NextResponse.json({ error: "Informe o nome da construtora." }, { status: 400 });
        }

        const { error } = await service.from("developers").insert({
          name,
          slug: cleanText(data.slug) || slugify(name),
          description: optionalText(data.description),
          logo_url: optionalText(data.logo_url),
          website: optionalText(data.website),
          phone: optionalText(data.phone),
          email: optionalText(data.email),
          is_active: parseBoolean(data.is_active, true),
        });

        if (error) {
          throw error;
        }

        return NextResponse.json({ ok: true, message: adminCatalogConfigs.construtora.successMessage });
      }

      case "bairro": {
        const name = cleanText(data.name);
        if (!name) {
          return NextResponse.json({ error: "Informe o nome do bairro." }, { status: 400 });
        }

        const { error } = await service.from("neighborhoods").insert({
          name,
          slug: cleanText(data.slug) || slugify(name),
          city: optionalText(data.city) || "São Paulo",
          state: optionalText(data.state) || "SP",
          description: optionalText(data.description),
          image_url: optionalText(data.image_url),
          meta_title: optionalText(data.meta_title),
          meta_description: optionalText(data.meta_description),
          is_active: parseBoolean(data.is_active, true),
        });

        if (error) {
          throw error;
        }

        return NextResponse.json({ ok: true, message: adminCatalogConfigs.bairro.successMessage });
      }

      case "blog": {
        const title = cleanText(data.title);
        const content = cleanText(data.content);
        if (!title) {
          return NextResponse.json({ error: "Informe o título do artigo." }, { status: 400 });
        }
        if (!content) {
          return NextResponse.json({ error: "Informe o conteúdo do artigo." }, { status: 400 });
        }

        const status = cleanText(data.status) || "draft";
        const publishedAt = parseDateTime(data.published_at);
        const resolvedPublishedAt = status === "published" ? publishedAt ?? new Date().toISOString() : publishedAt;

        const { error } = await service.from("blog_posts").insert({
          title,
          slug: cleanText(data.slug) || slugify(title),
          excerpt: optionalText(data.excerpt),
          content,
          cover_image: optionalText(data.cover_image),
          status,
          meta_title: optionalText(data.meta_title),
          meta_description: optionalText(data.meta_description),
          published_at: resolvedPublishedAt,
        });

        if (error) {
          throw error;
        }

        return NextResponse.json({ ok: true, message: adminCatalogConfigs.blog.successMessage });
      }

      default:
        return NextResponse.json({ error: "Cadastro não suportado." }, { status: 400 });
    }
  } catch (submitError) {
    const message = submitError instanceof Error ? submitError.message : "Não foi possível salvar o cadastro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
