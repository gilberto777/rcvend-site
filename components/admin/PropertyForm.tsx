"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExternalLink, FileText, GripVertical, ImagePlus, Save, Send, Sparkles, Trash2, Video } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createSupabaseClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/formatters";
import type { Property } from "@/types/property";

type PropertyFormProps = {
  initialProperty?: Property | null;
};

type PropertyAiResult = {
  highlights?: string[];
  card_callout?: string;
  whatsapp_message?: string;
  instagram_caption?: string;
  google_ads_headlines?: string[];
  google_ads_descriptions?: string[];
  seo_keywords?: string[];
  slug_suggestion?: string;
};

const inputClass = "rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-brand";
const sectionClass = "rounded-3xl border border-line bg-white p-6 shadow-sm";
const maxVideoSize = 500 * 1024 * 1024;
const amenityOptions = [
  "Piscina adulto",
  "Piscina infantil",
  "Salão de festas",
  "Coworking",
  "Lazer no rooftop",
  "Academia",
  "Mercadinho",
  "Salão de jogos",
  "Lavanderia",
  "Sauna",
  "Churrasqueira",
  "Espaço pet",
];

type ExistingMediaItem = {
  id: string;
  url: string;
  alt?: string | null;
  title?: string | null;
  sort_order?: number | null;
  is_cover?: boolean;
};

function isImageUrl(url: string) {
  const cleanUrl = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(avif|gif|jpe?g|png|webp|svg)$/.test(cleanUrl);
}

function mediaName(item: ExistingMediaItem, index: number, fallback: string) {
  return item.title || item.alt || `${fallback} ${index + 1}`;
}

function sortMediaItems<T extends ExistingMediaItem>(items: T[]) {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function moveMediaItem<T extends ExistingMediaItem>(items: T[], draggedId: string, targetId: string) {
  const ordered = sortMediaItems(items);
  const from = ordered.findIndex((item) => item.id === draggedId);
  const to = ordered.findIndex((item) => item.id === targetId);
  if (from < 0 || to < 0 || from === to) return ordered;

  const [dragged] = ordered.splice(from, 1);
  ordered.splice(to, 0, dragged);
  return ordered.map((item, index) => ({ ...item, sort_order: index, is_cover: index === 0 }));
}

function ExistingMediaGrid({
  title,
  emptyLabel,
  items,
  fallbackName,
  showCover,
  draggable,
  deletingId,
  onDelete,
  onMove,
}: {
  title: string;
  emptyLabel: string;
  items?: ExistingMediaItem[];
  fallbackName: string;
  showCover?: boolean;
  draggable?: boolean;
  deletingId?: string;
  onDelete?: (item: ExistingMediaItem) => void;
  onMove?: (draggedId: string, targetId: string) => void;
}) {
  const sortedItems = [...(items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (!sortedItems.length) {
    return <p className="mt-4 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-brand">{title}</p>
        <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-black text-muted">
          {sortedItems.length} arquivo(s)
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {sortedItems.map((item, index) => {
          const label = mediaName(item, index, fallbackName);
          const canPreview = isImageUrl(item.url);

          return (
            <article
              key={item.id || `${item.url}-${index}`}
              draggable={draggable}
              onDragStart={(event) => {
                if (!draggable) return;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", item.id);
              }}
              onDragOver={(event) => {
                if (!draggable) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                if (!draggable || !onMove) return;
                event.preventDefault();
                const draggedId = event.dataTransfer.getData("text/plain");
                if (draggedId && draggedId !== item.id) onMove(draggedId, item.id);
              }}
              className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              title={label}
            >
              <div className="relative aspect-[4/3] bg-line">
                {canPreview ? (
                  <Image
                    src={item.url}
                    alt={label}
                    fill
                    sizes="(min-width: 1280px) 12vw, (min-width: 1024px) 16vw, (min-width: 640px) 28vw, 45vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-background text-brand">
                    <FileText className="h-8 w-8" />
                  </div>
                )}
                {showCover && item.is_cover ? (
                  <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-black uppercase text-white">
                    Capa
                  </span>
                ) : null}
                <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-brand opacity-0 shadow-sm transition group-hover:opacity-100">
                  <ExternalLink className="h-4 w-4" />
                </span>
                {draggable ? (
                  <span className="absolute bottom-2 left-2 grid h-8 w-8 cursor-grab place-items-center rounded-full bg-white/95 text-brand shadow-sm active:cursor-grabbing">
                    <GripVertical className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-bold text-foreground">{label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 flex-1 items-center justify-center rounded-xl border border-line px-2 text-[11px] font-black text-brand transition hover:border-brand"
                  >
                    Abrir
                  </a>
                  {onDelete ? (
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => onDelete(item)}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                      aria-label={`Excluir ${label}`}
                      title="Excluir foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function PropertyForm({ initialProperty }: PropertyFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [description, setDescription] = useState(initialProperty?.description ?? "");
  const [aiEnterprise, setAiEnterprise] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiDifferentiators, setAiDifferentiators] = useState("");
  const [aiTone, setAiTone] = useState("premium");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResult, setAiResult] = useState<PropertyAiResult | null>(null);
  const [metaTitle, setMetaTitle] = useState(initialProperty?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initialProperty?.meta_description ?? "");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedFloorPlans, setSelectedFloorPlans] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [photoItems, setPhotoItems] = useState<ExistingMediaItem[]>(() => sortMediaItems(initialProperty?.images ?? []));
  const [currentCoverImage, setCurrentCoverImage] = useState(initialProperty?.cover_image ?? photoItems[0]?.url ?? "");
  const [deletingPhotoId, setDeletingPhotoId] = useState("");

  function getErrorMessage(error: unknown, fallback = "Não foi possível salvar.") {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String((error as { message: unknown }).message);
    if (typeof error === "string") return error;
    return fallback;
  }

  async function uploadFiles(files: File[], propertySlug: string, folder = "fotos", bucket = "property-images") {
    if (!files.length) return [];
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error("Supabase nao configurado.");

    const uploadedPhotos = [];

    for (const [index, file] of files.entries()) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const path = `${propertySlug}/${folder}/${Date.now()}-${index}-${safeName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(`Falha ao enviar ${file.name}: ${getErrorMessage(error)}`);

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedPhotos.push({ url: data.publicUrl, path });
    }

    return uploadedPhotos;
  }

  async function persistPhotoOrder(nextItems: ExistingMediaItem[]) {
    if (!initialProperty?.id) return;

    const supabase = createSupabaseClient();
    if (!supabase) throw new Error("Supabase nao configurado.");

    const orderedItems = nextItems.map((item, index) => ({ ...item, sort_order: index, is_cover: index === 0 }));
    const coverImage = orderedItems[0]?.url ?? "";

    const updates = orderedItems.map((item, index) =>
      supabase
        .from("property_images")
        .update({ order_index: index, is_cover: index === 0 })
        .eq("id", item.id),
    );
    const results = await Promise.all(updates);
    const imageError = results.find((result) => result.error)?.error;
    if (imageError) throw new Error(getErrorMessage(imageError, "Nao foi possivel atualizar a ordem das fotos."));

    const { error: propertyError } = await supabase
      .from("properties")
      .update({ cover_image: coverImage })
      .eq("id", initialProperty.id);
    if (propertyError) throw new Error(getErrorMessage(propertyError, "Nao foi possivel atualizar a foto de capa."));

    setPhotoItems(orderedItems);
    setCurrentCoverImage(coverImage);
  }

  async function handleMovePhoto(draggedId: string, targetId: string) {
    const previousItems = photoItems;
    const nextItems = moveMediaItem(photoItems, draggedId, targetId);
    if (nextItems === previousItems) return;

    setMessage("");
    setPhotoItems(nextItems);
    setCurrentCoverImage(nextItems[0]?.url ?? "");

    try {
      await persistPhotoOrder(nextItems);
      setMessage("Ordem das fotos atualizada.");
      router.refresh();
    } catch (error) {
      setPhotoItems(previousItems);
      setCurrentCoverImage(previousItems[0]?.url ?? "");
      setMessage(getErrorMessage(error, "Nao foi possivel reordenar as fotos."));
    }
  }

  async function handleDeletePhoto(item: ExistingMediaItem) {
    if (!initialProperty?.id) return;
    const confirmed = window.confirm("Excluir esta foto da galeria do imovel?");
    if (!confirmed) return;

    const previousItems = photoItems;
    const nextItems = previousItems
      .filter((photo) => photo.id !== item.id)
      .map((photo, index) => ({ ...photo, sort_order: index, is_cover: index === 0 }));

    setMessage("");
    setDeletingPhotoId(item.id);
    setPhotoItems(nextItems);
    setCurrentCoverImage(nextItems[0]?.url ?? "");

    try {
      const supabase = createSupabaseClient();
      if (!supabase) throw new Error("Supabase nao configurado.");

      const { error: deleteError } = await supabase.from("property_images").delete().eq("id", item.id);
      if (deleteError) throw new Error(getErrorMessage(deleteError, "Nao foi possivel excluir a foto."));

      await persistPhotoOrder(nextItems);
      setMessage("Foto excluida da galeria.");
      router.refresh();
    } catch (error) {
      setPhotoItems(previousItems);
      setCurrentCoverImage(previousItems[0]?.url ?? "");
      setMessage(getErrorMessage(error, "Nao foi possivel excluir a foto."));
    } finally {
      setDeletingPhotoId("");
    }
  }

  async function saveProperty(formElement: HTMLFormElement, publish: boolean) {
    setMessage("");
    setLoading(true);

    try {
      const supabase = createSupabaseClient();
      if (!supabase) throw new Error("Configure o Supabase no .env.local antes de salvar no banco.");

      const form = new FormData(formElement);
      const generatedSlug = String(form.get("slug") || slugify(title));
      const photos = form.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
      const floorPlans = form.getAll("floor_plans").filter((file): file is File => file instanceof File && file.size > 0);
      const videos = form.getAll("video").filter((file): file is File => file instanceof File && file.size > 0);
      const oversizedVideo = videos.find((file) => file.size > maxVideoSize);
      if (oversizedVideo) {
        throw new Error(`O vídeo ${oversizedVideo.name} passa de 500 MB. Envie um arquivo menor.`);
      }
      const uploadedPhotos = await uploadFiles(photos, generatedSlug, "fotos");
      const uploadedFloorPlans = await uploadFiles(floorPlans, generatedSlug, "plantas");
      const uploadedVideos = await uploadFiles(videos, generatedSlug, "videos", "property-videos");
      const coverImage = uploadedPhotos[0]?.url ?? currentCoverImage ?? "";
      const videoUrl = uploadedVideos[0]?.url ?? String(form.get("video_url") || initialProperty?.video_url || "");
      const selectedCharacteristics = form.getAll("characteristics").map((item) => String(item));
      const extraCharacteristics = String(form.get("extra_characteristics") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const characteristics = Array.from(new Set([...selectedCharacteristics, ...extraCharacteristics]));

      const payload = {
        title,
        slug: generatedSlug,
        description,
        type: String(form.get("type")),
        purpose: String(form.get("purpose")),
        property_stage: String(form.get("property_stage")),
        status: String(form.get("status")),
        approval_status: String(form.get("approval_status")),
        price: Number(form.get("price")),
        condo_fee: Number(form.get("condo_fee") || 0),
        iptu: Number(form.get("iptu") || 0),
        area: Number(form.get("area")),
        bedrooms: Number(form.get("bedrooms")),
        bathrooms: Number(form.get("bathrooms")),
        suites: Number(form.get("suites")),
        parking_spaces: Number(form.get("parking_spaces")),
        neighborhood_name: String(form.get("neighborhood")),
        city: String(form.get("city")),
        state: String(form.get("state")),
        address: String(form.get("address")),
        latitude: Number(form.get("latitude") || 0) || null,
        longitude: Number(form.get("longitude") || 0) || null,
        cover_image: coverImage,
        is_featured: form.get("is_featured") === "on",
        is_active: publish ? true : form.get("is_active") === "on",
        meta_title: String(form.get("meta_title") || title),
        meta_description: String(form.get("meta_description") || description),
        video_url: videoUrl || null,
        tour_url: String(form.get("tour_url") || "") || null,
        characteristics,
      };

      if (initialProperty?.id) {
        const { error } = await supabase.from("properties").update(payload).eq("id", initialProperty.id);
        if (error) throw new Error(getErrorMessage(error));

        if (uploadedPhotos.length) {
          const nextOrderIndex = photoItems.length;
          await supabase.from("property_images").insert(
            uploadedPhotos.map((photo, index) => ({
              property_id: initialProperty.id,
              image_url: photo.url,
              storage_path: photo.path,
              alt_text: title,
              order_index: nextOrderIndex + index,
              is_cover: !initialProperty.cover_image && index === 0,
            })),
          );
        }

        if (uploadedFloorPlans.length) {
          const nextFloorPlanOrderIndex = initialProperty.floor_plans?.length ?? 0;
          await supabase.from("property_floor_plans").insert(
            uploadedFloorPlans.map((plan, index) => ({
              property_id: initialProperty.id,
              image_url: plan.url,
              storage_path: plan.path,
              title: `Planta ${nextFloorPlanOrderIndex + index + 1}`,
              order_index: nextFloorPlanOrderIndex + index,
            })),
          );
        }

        await supabase.from("property_features").delete().eq("property_id", initialProperty.id);
        if (characteristics.length) {
          await supabase.from("property_features").insert(characteristics.map((name) => ({ property_id: initialProperty.id, name })));
        }
        setMessage("Imovel atualizado com sucesso.");
      } else {
        const { data, error } = await supabase.from("properties").insert(payload).select("id").single();
        if (error) throw new Error(getErrorMessage(error));

        if (uploadedPhotos.length && data?.id) {
          await supabase.from("property_images").insert(
            uploadedPhotos.map((photo, index) => ({
              property_id: data.id,
              image_url: photo.url,
              storage_path: photo.path,
              alt_text: title,
              order_index: index,
              is_cover: index === 0,
            })),
          );
        }

        if (uploadedFloorPlans.length && data?.id) {
          await supabase.from("property_floor_plans").insert(
            uploadedFloorPlans.map((plan, index) => ({
              property_id: data.id,
              image_url: plan.url,
              storage_path: plan.path,
              title: `Planta ${index + 1}`,
              order_index: index,
            })),
          );
        }

        if (data?.id && characteristics.length) {
          await supabase.from("property_features").insert(characteristics.map((name) => ({ property_id: data.id, name })));
        }
        setMessage(publish ? "Imovel publicado com sucesso." : "Rascunho salvo com sucesso.");
      }

      router.refresh();
      setSelectedPhotos([]);
      setSelectedFloorPlans([]);
      setSelectedVideo("");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProperty(event.currentTarget, true);
  }

  async function handleAiFill() {
    const enterpriseName = aiEnterprise.trim();
    if (enterpriseName.length < 3) {
      setAiMessage("Digite o nome do empreendimento.");
      return;
    }

    setAiLoading(true);
    setAiMessage("");

    try {
      const supabase = createSupabaseClient();
      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const token = sessionData.session?.access_token;
      const formData = formRef.current ? new FormData(formRef.current) : new FormData();
      const selectedCharacteristics = formData.getAll("characteristics").map((item) => String(item));
      const extraCharacteristics = String(formData.get("extra_characteristics") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch("/api/admin/property-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          enterpriseName,
          neighborhood: formData.get("neighborhood"),
          city: formData.get("city"),
          type: formData.get("type"),
          purpose: formData.get("purpose"),
          price: formData.get("price"),
          area: formData.get("area"),
          bedrooms: formData.get("bedrooms"),
          bathrooms: formData.get("bathrooms"),
          suites: formData.get("suites"),
          parking_spaces: formData.get("parking_spaces"),
          characteristics: Array.from(new Set([...selectedCharacteristics, ...extraCharacteristics])),
          audience: aiAudience,
          differentiators: aiDifferentiators,
          tone: aiTone,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar sugestão.");

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setMetaTitle(data.meta_title ?? data.title ?? "");
      setMetaDescription(data.meta_description ?? data.description ?? "");
      setAiResult({
        highlights: data.highlights,
        card_callout: data.card_callout,
        whatsapp_message: data.whatsapp_message,
        instagram_caption: data.instagram_caption,
        google_ads_headlines: data.google_ads_headlines,
        google_ads_descriptions: data.google_ads_descriptions,
        seo_keywords: data.seo_keywords,
        slug_suggestion: data.slug_suggestion,
      });
      const openAiDetail = data.openai_status
        ? ` Status ${data.openai_status}${data.openai_code ? ` (${data.openai_code})` : ""}${data.openai_message ? `: ${data.openai_message}` : ""}`
        : "";
      const aiMessages: Record<string, string> = {
        openai: "Anuncio completo gerado pela IA.",
        no_key: "Sugestao local gerada. Configure OPENAI_API_KEY para usar IA real.",
        openai_error: `Sugestao local gerada. A OpenAI nao respondeu corretamente; confira chave, credito ou modelo.${openAiDetail}`,
        parse_error: "Sugestao local gerada. A IA respondeu fora do formato esperado.",
      };
      setAiMessage(aiMessages[String(data.mode)] ?? "Sugestao local gerada.");
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : "Não foi possível gerar sugestão.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <form ref={formRef} className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">IA de cadastro</p>
            <h2 className="mt-2 text-xl font-black">Gerar anuncio imobiliario completo</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">Preencha os dados principais abaixo, informe o empreendimento e use a IA para gerar titulo, descricao, SEO, destaques e textos de divulgacao.</p>
          </div>
          <div className="grid gap-3 lg:min-w-[560px]">
            <input
              value={aiEnterprise}
              onChange={(event) => setAiEnterprise(event.target.value)}
              placeholder="Nome do empreendimento ou imovel. Ex: Reserva Brooklin"
              className={inputClass}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={aiTone} onChange={(event) => setAiTone(event.target.value)} className={inputClass}>
                <option value="premium">Tom premium</option>
                <option value="direto">Tom direto</option>
                <option value="investidor">Tom investidor</option>
                <option value="familia">Tom familia</option>
                <option value="lancamento">Tom lancamento</option>
              </select>
              <input
                value={aiAudience}
                onChange={(event) => setAiAudience(event.target.value)}
                placeholder="Publico-alvo. Ex: investidor, primeira moradia"
                className={inputClass}
              />
            </div>
            <textarea
              value={aiDifferentiators}
              onChange={(event) => setAiDifferentiators(event.target.value)}
              placeholder="Diferenciais reais para a IA usar. Ex: perto do metro, varanda, lazer completo, entrega em 2027, vista livre"
              rows={3}
              className={inputClass}
            />
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => void handleAiFill()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-black text-white hover:bg-brand-strong disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              {aiLoading ? "Gerando..." : "Preencher com IA"}
            </button>
          </div>
        </div>
        {aiMessage && <p className="mt-4 rounded-2xl border border-line bg-background p-3 text-sm font-semibold text-brand">{aiMessage}</p>}
        {aiResult && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <AiOutput title="Destaques do anuncio" value={(aiResult.highlights ?? []).map((item) => `- ${item}`).join("\n")} />
            <AiOutput title="Chamada curta para card" value={aiResult.card_callout ?? ""} />
            <AiOutput title="Mensagem de WhatsApp" value={aiResult.whatsapp_message ?? ""} />
            <AiOutput title="Legenda para Instagram" value={aiResult.instagram_caption ?? ""} />
            <AiOutput title="Titulos para Google Ads" value={(aiResult.google_ads_headlines ?? []).map((item) => `- ${item}`).join("\n")} />
            <AiOutput title="Descricoes para Google Ads" value={(aiResult.google_ads_descriptions ?? []).map((item) => `- ${item}`).join("\n")} />
            <AiOutput title="Palavras-chave SEO" value={(aiResult.seo_keywords ?? []).join(", ")} />
            <AiOutput title="Slug sugerido" value={aiResult.slug_suggestion ?? ""} />
          </div>
        )}
      </section>

      <FormSection title="Dados principais" description="Informacoes comerciais que aparecem para o cliente.">
        <label className="grid gap-2 md:col-span-2">
          <span className="font-bold">ID interno do imóvel</span>
          <input className={`${inputClass} font-black text-brand`} value={initialProperty?.code ?? "Gerado automaticamente ao salvar"} disabled />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="font-bold">Titulo</span>
          <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <div className="grid gap-2 md:col-span-2">
          <span className="font-bold">Descrição</span>
          <RichTextEditor value={description} onChange={setDescription} />
          <input type="hidden" name="description" value={description} />
        </div>
        <Select name="type" label="Tipo" defaultValue={initialProperty?.type ?? "apartment"} options={[["studio", "Studio"], ["apartment", "Apartamento"], ["house", "Casa"], ["penthouse", "Cobertura"], ["commercial", "Comercial"], ["land", "Terreno"]]} />
        <Select name="purpose" label="Finalidade" defaultValue={initialProperty?.purpose ?? "sale"} options={[["sale", "Venda"], ["rent", "Aluguel"], ["launch", "Lançamento"]]} />
        <Select name="property_stage" label="Fase do imóvel" defaultValue={initialProperty?.property_stage ?? (initialProperty?.purpose === "launch" ? "launch" : "ready")} options={[["launch", "Lançamento"], ["under_construction", "Em construção"], ["ready", "Pronto para morar"]]} />
        <Select name="status" label="Status" defaultValue={initialProperty?.status ?? "available"} options={[["available", "Disponivel"], ["reserved", "Reservado"], ["sold", "Vendido"], ["rented", "Alugado"], ["inactive", "Inativo"]]} />
      </FormSection>

      <FormSection title="Valores" description="Preco e custos recorrentes.">
        <Input name="price" label="Preco" type="number" step="any" min="0" required defaultValue={initialProperty?.price} />
        <Input name="condo_fee" label="Condominio" type="number" step="any" min="0" defaultValue={initialProperty?.condo_fee ?? ""} />
        <Input name="iptu" label="IPTU" type="number" step="any" min="0" defaultValue={initialProperty?.iptu ?? ""} />
      </FormSection>

      <FormSection title="Caracteristicas" description="Detalhes usados nos cards, filtros e comparacao.">
        <Input name="area" label="Area" type="number" step="any" min="0" required defaultValue={initialProperty?.area} />
        <Input name="bedrooms" label="Dormitorios" type="number" min="0" defaultValue={initialProperty?.bedrooms ?? 0} />
        <Input name="suites" label="Suites" type="number" min="0" defaultValue={initialProperty?.suites ?? 0} />
        <Input name="bathrooms" label="Banheiros" type="number" min="0" defaultValue={initialProperty?.bathrooms ?? 0} />
        <Input name="parking_spaces" label="Vagas" type="number" min="0" defaultValue={initialProperty?.parking_spaces ?? 0} />
        <div className="grid gap-3 md:col-span-2">
          <div>
            <p className="font-bold">Características do condomínio</p>
            <p className="mt-1 text-sm text-muted">Marque os itens disponíveis no imóvel ou empreendimento.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3 font-semibold transition hover:border-brand/40 hover:bg-white"
              >
                <input
                  name="characteristics"
                  type="checkbox"
                  value={amenity}
                  defaultChecked={initialProperty?.characteristics?.includes(amenity)}
                  className="h-5 w-5 rounded border-line accent-[#0f4a43]"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
          <label className="grid gap-2">
            <span className="font-bold">Outras características</span>
            <input
              name="extra_characteristics"
              placeholder="Ex: varanda gourmet, bicicletário, quadra"
              className={inputClass}
              defaultValue={initialProperty?.characteristics?.filter((item) => !amenityOptions.includes(item)).join(", ")}
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Localização" description="Endereço e coordenadas para integração com o mapa.">
        <Input name="neighborhood" label="Bairro" required defaultValue={initialProperty?.neighborhood} />
        <Input name="city" label="Cidade" required defaultValue={initialProperty?.city ?? "São Paulo"} />
        <Input name="state" label="Estado" required defaultValue={initialProperty?.state ?? "SP"} />
        <Input name="address" label="Endereço" defaultValue={initialProperty?.address ?? ""} />
        <Input name="latitude" label="Latitude" type="number" step="any" defaultValue={initialProperty?.latitude ?? ""} />
        <Input name="longitude" label="Longitude" type="number" step="any" defaultValue={initialProperty?.longitude ?? ""} />
      </FormSection>

      <FormSection title="Fotos" description="Selecione varias fotos de uma vez. No novo cadastro, a primeira imagem enviada sera usada como capa.">
        <div className="md:col-span-2 rounded-2xl border border-dashed border-line bg-background p-5">
          <ImagePlus className="h-6 w-6 text-brand" />
          <p className="mt-2 font-black">Galeria de imagens</p>
          <p className="mt-1 text-sm text-muted">Use o botão abaixo para carregar todas as fotos do imóvel em uma única seleção.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-black text-white hover:bg-brand-strong">
            <ImagePlus className="h-5 w-5" />
            Carregar fotos
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                setSelectedPhotos(Array.from(event.target.files ?? []).map((file) => file.name));
              }}
            />
          </label>
          {selectedPhotos.length > 0 && (
            <div className="mt-4 rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-black text-brand">{selectedPhotos.length} foto(s) selecionada(s)</p>
              <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
                {selectedPhotos.map((fileName, index) => (
                  <li key={`${fileName}-${index}`} className="truncate">{fileName}</li>
                ))}
              </ul>
            </div>
          )}
          {photoItems.length ? (
            <ExistingMediaGrid
              title="Fotos ja cadastradas neste imovel"
              emptyLabel="Nenhuma foto cadastrada neste imovel."
              items={photoItems}
              fallbackName="Foto"
              showCover
              draggable
              deletingId={deletingPhotoId}
              onDelete={(item) => void handleDeletePhoto(item)}
              onMove={(draggedId, targetId) => void handleMovePhoto(draggedId, targetId)}
            />
          ) : (
            <p className="mt-3 text-sm text-muted">Nenhuma foto cadastrada neste imovel.</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Plantas" description="Suba plantas separadas das fotos do imóvel para facilitar a análise do cliente.">
        <div className="md:col-span-2 rounded-2xl border border-dashed border-line bg-background p-5">
          <ImagePlus className="h-6 w-6 text-brand" />
          <p className="mt-2 font-black">Plantas do imóvel</p>
          <p className="mt-1 text-sm text-muted">Use este card apenas para plantas, layouts e imagens tecnicas do empreendimento.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-black text-white hover:bg-brand-strong">
            <ImagePlus className="h-5 w-5" />
            Carregar plantas
            <input
              name="floor_plans"
              type="file"
              accept="image/*,.pdf"
              multiple
              className="sr-only"
              onChange={(event) => {
                setSelectedFloorPlans(Array.from(event.target.files ?? []).map((file) => file.name));
              }}
            />
          </label>
          {selectedFloorPlans.length > 0 && (
            <div className="mt-4 rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-black text-brand">{selectedFloorPlans.length} planta(s) selecionada(s)</p>
              <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
                {selectedFloorPlans.map((fileName, index) => (
                  <li key={`${fileName}-${index}`} className="truncate">{fileName}</li>
                ))}
              </ul>
            </div>
          )}
          {initialProperty?.floor_plans?.length ? (
            <ExistingMediaGrid
              title="Plantas ja cadastradas neste imovel"
              emptyLabel="Nenhuma planta cadastrada neste imovel."
              items={initialProperty.floor_plans}
              fallbackName="Planta"
            />
          ) : (
            <p className="mt-3 text-sm text-muted">Nenhuma planta cadastrada neste imovel.</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Mídia adicional" description="Adicione vídeo hospedado no site e link de tour virtual do empreendimento.">
        <label className="grid gap-2 md:col-span-2">
          <span className="font-bold">Link do tour virtual</span>
          <input
            name="tour_url"
            type="url"
            placeholder="https://..."
            className={inputClass}
            defaultValue={initialProperty?.tour_url ?? ""}
          />
        </label>
        <div className="md:col-span-2 rounded-2xl border border-dashed border-line bg-background p-5">
          <Video className="h-6 w-6 text-brand" />
          <p className="mt-2 font-black">Vídeo do imóvel</p>
          <p className="mt-1 text-sm text-muted">Suba um video MP4, WebM ou MOV de ate 500 MB para reproduzir direto no site, sem YouTube.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-black text-white hover:bg-brand-strong">
            <Video className="h-5 w-5" />
            Selecionar video
            <input
              name="video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(event) => {
                setSelectedVideo(event.target.files?.[0]?.name ?? "");
              }}
            />
          </label>
          <input type="hidden" name="video_url" value={initialProperty?.video_url ?? ""} />
          {selectedVideo ? (
            <p className="mt-3 rounded-2xl border border-line bg-white p-3 text-sm font-semibold text-brand">{selectedVideo}</p>
          ) : initialProperty?.video_url ? (
            <div className="mt-4 rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-black text-brand">Vídeo já cadastrado</p>
              <video src={initialProperty.video_url} controls className="mt-3 aspect-video w-full rounded-2xl bg-black object-contain" />
            </div>
          ) : null}
        </div>
      </FormSection>

      <FormSection title="SEO" description="Campos usados por paginas publicas e compartilhamento.">
        <Input name="slug" label="Slug" defaultValue={initialProperty?.slug ?? slugify(title)} />
        <Input name="meta_title" label="Meta title" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
        <label className="grid gap-2 md:col-span-2">
          <span className="font-bold">Meta description</span>
          <textarea name="meta_description" rows={3} className={inputClass} value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} />
        </label>
      </FormSection>

      <section className={sectionClass}>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black">Publicacao</h2>
            <p className="mt-1 text-sm text-muted">Controle visibilidade, destaque e aprovacao editorial.</p>
          </div>
          <Select name="approval_status" label="Aprovacao" defaultValue={initialProperty?.approval_status ?? "approved"} options={[["pending", "Pendente"], ["approved", "Aprovado"], ["rejected", "Rejeitado"]]} compact />
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 font-semibold"><input name="is_active" type="checkbox" defaultChecked={initialProperty?.is_active ?? true} /> Ativo</label>
          <label className="flex items-center gap-2 font-semibold"><input name="is_featured" type="checkbox" defaultChecked={initialProperty?.is_featured} /> Destaque</label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={loading}
            onClick={(event) => {
              if (event.currentTarget.form) void saveProperty(event.currentTarget.form, false);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-6 py-4 font-black text-brand hover:border-brand disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            Salvar rascunho
          </button>
          <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 font-black text-white hover:bg-brand-strong disabled:opacity-60">
            <Send className="h-5 w-5" />
            {loading ? "Salvando..." : "Publicar"}
          </button>
        </div>
        {message && <p className="mt-5 rounded-2xl border border-line bg-background p-4 text-sm font-semibold text-brand">{message}</p>}
      </section>
    </form>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className={sectionClass}>
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function AiOutput({ title, value }: { title: string; value: string }) {
  if (!value) return null;

  return (
    <label className="grid gap-2 rounded-2xl border border-line bg-background p-4">
      <span className="text-sm font-black text-brand">{title}</span>
      <textarea readOnly rows={4} value={value} className="resize-none rounded-xl border border-line bg-white p-3 text-sm leading-6 outline-none" />
    </label>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-bold">{label}</span>
      <input className={inputClass} {...props} />
    </label>
  );
}

function Select({
  label,
  options,
  compact,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Array<[string, string]>; compact?: boolean }) {
  return (
    <label className={`grid gap-2 ${compact ? "min-w-52" : ""}`}>
      <span className="font-bold">{label}</span>
      <select className={inputClass} {...props}>
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}


