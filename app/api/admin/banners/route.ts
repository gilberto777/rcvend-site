import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  hasValidLocalAdminSession,
  isLocalAdminEnabled,
} from "@/lib/admin/local-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PromotionalBanner } from "@/types/banner";

export const dynamic = "force-dynamic";

const localCatalogPath = path.join(process.cwd(), "data", "banners.json");
const localUploadDirectory = path.join(process.cwd(), "public", "uploads", "banners");
const maxImageSize = 8 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type AdminContext =
  | { mode: "local" }
  | { mode: "supabase"; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> };

async function requireAdmin(): Promise<AdminContext | NextResponse> {
  if (isLocalAdminEnabled()) {
    if (await hasValidLocalAdminSession()) return { mode: "local" };
    return NextResponse.json({ error: "Sessão administrativa inválida." }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Você precisa entrar novamente no admin." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    return NextResponse.json({ error: "Sem permissão para gerenciar banners." }, { status: 403 });
  }

  return { mode: "supabase", supabase };
}

function isErrorResponse(value: AdminContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

async function readLocalCatalog() {
  try {
    return JSON.parse(await readFile(localCatalogPath, "utf8")) as PromotionalBanner[];
  } catch {
    return [] as PromotionalBanner[];
  }
}

async function writeLocalCatalog(banners: PromotionalBanner[]) {
  await writeFile(localCatalogPath, `${JSON.stringify(banners, null, 2)}\n`, "utf8");
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Informe uma data válida.");
  }

  return parsed.toISOString();
}

async function uploadImage(file: File, prefix: string, context: AdminContext) {
  const extension = allowedImageTypes.get(file.type);
  if (!extension) {
    throw new Error("Envie uma imagem PNG, JPG ou WebP.");
  }
  if (file.size > maxImageSize) {
    throw new Error("A imagem deve ter no máximo 8 MB.");
  }

  const storagePath = `${prefix}-${randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (context.mode === "local") {
    await mkdir(localUploadDirectory, { recursive: true });
    await writeFile(path.join(localUploadDirectory, storagePath), bytes);
    return {
      url: `/uploads/banners/${storagePath}`,
      storagePath: null,
    };
  }

  const { error } = await context.supabase.storage
    .from("promotional-banners")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = context.supabase.storage
    .from("promotional-banners")
    .getPublicUrl(storagePath);

  return {
    url: data.publicUrl,
    storagePath,
  };
}

export async function GET() {
  const context = await requireAdmin();
  if (isErrorResponse(context)) return context;

  if (context.mode === "local") {
    return NextResponse.json(
      { banners: (await readLocalCatalog()).sort((left, right) => left.sort_order - right.sort_order) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { data, error } = await context.supabase
    .from("promotional_banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { banners: data as PromotionalBanner[] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (isErrorResponse(context)) return context;

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const altText = String(formData.get("alt_text") ?? "").trim();
    const linkUrl = String(formData.get("link_url") ?? "").trim();
    const desktopImage = formData.get("image");
    const mobileImage = formData.get("mobile_image");

    if (!title || !altText || !linkUrl) {
      return NextResponse.json(
        { error: "Preencha título, texto alternativo e link de destino." },
        { status: 400 },
      );
    }
    if (!linkUrl.startsWith("/") && !/^https?:\/\//i.test(linkUrl)) {
      return NextResponse.json(
        { error: "O link deve começar com / ou usar http:// ou https://." },
        { status: 400 },
      );
    }
    if (!(desktopImage instanceof File) || desktopImage.size === 0) {
      return NextResponse.json({ error: "Selecione a imagem principal do banner." }, { status: 400 });
    }

    const startsAt = parseOptionalDate(formData.get("starts_at"));
    const endsAt = parseOptionalDate(formData.get("ends_at"));
    if (startsAt && endsAt && Date.parse(startsAt) >= Date.parse(endsAt)) {
      return NextResponse.json(
        { error: "A data final deve ser posterior à data inicial." },
        { status: 400 },
      );
    }

    const desktopUpload = await uploadImage(desktopImage, "desktop", context);
    const mobileUpload =
      mobileImage instanceof File && mobileImage.size > 0
        ? await uploadImage(mobileImage, "mobile", context)
        : null;
    const now = new Date().toISOString();
    const banner: PromotionalBanner = {
      id: randomUUID(),
      title,
      image_url: desktopUpload.url,
      mobile_image_url: mobileUpload?.url ?? null,
      image_storage_path: desktopUpload.storagePath,
      mobile_image_storage_path: mobileUpload?.storagePath ?? null,
      alt_text: altText,
      link_url: linkUrl,
      sort_order: Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0,
      is_active: String(formData.get("is_active") ?? "true") === "true",
      starts_at: startsAt,
      ends_at: endsAt,
      created_at: now,
      updated_at: now,
    };

    if (context.mode === "local") {
      const banners = await readLocalCatalog();
      banners.push(banner);
      await writeLocalCatalog(banners);
    } else {
      const { error } = await context.supabase.from("promotional_banners").insert(banner);
      if (error) throw error;
    }

    revalidatePath("/");
    return NextResponse.json({ banner, message: "Banner criado com sucesso." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível criar o banner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const context = await requireAdmin();
  if (isErrorResponse(context)) return context;

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    is_active?: boolean;
  } | null;

  if (!body?.id || typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "Alteração inválida." }, { status: 400 });
  }

  if (context.mode === "local") {
    const banners = await readLocalCatalog();
    const banner = banners.find((item) => item.id === body.id);
    if (!banner) return NextResponse.json({ error: "Banner não encontrado." }, { status: 404 });
    banner.is_active = body.is_active;
    banner.updated_at = new Date().toISOString();
    await writeLocalCatalog(banners);
  } else {
    const { error } = await context.supabase
      .from("promotional_banners")
      .update({ is_active: body.is_active })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const context = await requireAdmin();
  if (isErrorResponse(context)) return context;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Banner não informado." }, { status: 400 });

  if (context.mode === "local") {
    const banners = await readLocalCatalog();
    const remaining = banners.filter((banner) => banner.id !== id);
    if (remaining.length === banners.length) {
      return NextResponse.json({ error: "Banner não encontrado." }, { status: 404 });
    }
    await writeLocalCatalog(remaining);
  } else {
    const { data: banner } = await context.supabase
      .from("promotional_banners")
      .select("image_storage_path, mobile_image_storage_path")
      .eq("id", id)
      .maybeSingle();
    const { error } = await context.supabase.from("promotional_banners").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const storagePaths = [
      banner?.image_storage_path,
      banner?.mobile_image_storage_path,
    ].filter((value): value is string => Boolean(value));
    if (storagePaths.length) {
      await context.supabase.storage.from("promotional-banners").remove(storagePaths);
    }
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
