"use client";

import { createSupabaseClient } from "@/lib/supabase/client";
import type { Lead, Property, PropertyFloorPlan, PropertyImage } from "@/types/property";

type SupabasePropertyImage = {
  id: string;
  property_id: string;
  image_url?: string | null;
  url?: string | null;
  alt_text?: string | null;
  alt?: string | null;
  order_index?: number | null;
  sort_order?: number | null;
  is_cover: boolean;
};

type SupabasePropertyFeature = {
  name: string;
};

type SupabasePropertyFloorPlan = {
  id: string;
  property_id: string;
  image_url?: string | null;
  storage_path?: string | null;
  title?: string | null;
  order_index?: number | null;
  sort_order?: number | null;
};

type SupabasePropertyRow = Omit<Property, "images" | "floor_plans" | "neighborhood" | "is_launch"> & {
  neighborhood?: string | null;
  neighborhood_name?: string | null;
  property_images?: SupabasePropertyImage[] | null;
  property_floor_plans?: SupabasePropertyFloorPlan[] | null;
  property_features?: SupabasePropertyFeature[] | null;
};

type SupabaseLeadRow = Lead & {
  properties?: { title: string; slug: string } | null;
};

export type AdminLead = Lead & {
  property_title?: string | null;
  property_slug?: string | null;
};

function mapImage(image: SupabasePropertyImage): PropertyImage {
  return {
    id: image.id,
    property_id: image.property_id,
    url: image.image_url ?? image.url ?? "",
    alt: image.alt_text ?? image.alt ?? "",
    sort_order: image.order_index ?? image.sort_order ?? 0,
    is_cover: image.is_cover,
  };
}

function mapFloorPlan(plan: SupabasePropertyFloorPlan): PropertyFloorPlan {
  return {
    id: plan.id,
    property_id: plan.property_id,
    url: plan.image_url ?? "",
    title: plan.title,
    sort_order: plan.order_index ?? plan.sort_order ?? 0,
  };
}

export function mapAdminProperty(row: SupabasePropertyRow): Property {
  const features = row.property_features?.map((feature) => feature.name).filter(Boolean) ?? [];
  const images = row.property_images
    ?.map(mapImage)
    .filter((image) => image.url)
    .sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const floorPlans = row.property_floor_plans
    ?.map(mapFloorPlan)
    .filter((plan) => plan.url)
    .sort((a, b) => a.sort_order - b.sort_order) ?? [];

  return {
    ...row,
    neighborhood: row.neighborhood_name ?? row.neighborhood ?? "",
    images,
    floor_plans: floorPlans,
    characteristics: row.characteristics?.length ? row.characteristics : features,
    property_stage: row.property_stage ?? (row.purpose === "launch" ? "launch" : "ready"),
    is_launch: row.purpose === "launch",
  };
}

export async function listAdminProperties() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    const response = await fetch("/api/admin/local-properties", {
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      error?: string;
      properties?: Property[];
    } | null;

    if (!response.ok || !result?.properties) {
      throw new Error(result?.error ?? "Não foi possível carregar os imóveis locais.");
    }

    return result.properties;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*), property_floor_plans(*), property_features(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as SupabasePropertyRow[]).map(mapAdminProperty);
}

export async function listAdminLeads() {
  const supabase = createSupabaseClient();
  if (!supabase) return [] as AdminLead[];

  const { data, error } = await supabase
    .from("leads")
    .select("*, properties(title, slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return (data as SupabaseLeadRow[]).map((lead) => ({
    ...lead,
    property_title: lead.properties?.title ?? null,
    property_slug: lead.properties?.slug ?? null,
  }));
}

export async function updatePropertyState(id: string, payload: Partial<Pick<Property, "is_active" | "is_featured" | "status">>) {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from("properties").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProperty(id: string) {
  const supabase = createSupabaseClient();
  if (!supabase) {
    const response = await fetch(`/api/admin/local-properties/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(result?.error ?? "Não foi possível excluir o imóvel.");
    }

    return;
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicateProperty(property: Property) {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase nao configurado.");

  const duplicated = {
    title: `${property.title} (copia)`,
    slug: `${property.slug}-copia-${Date.now()}`,
    description: property.description,
    purpose: property.purpose,
    property_stage: property.property_stage,
    type: property.type,
    status: "inactive",
    approval_status: "pending",
    price: property.price,
    condo_fee: property.condo_fee,
    iptu: property.iptu,
    area: property.area,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    suites: property.suites,
    parking_spaces: property.parking_spaces,
    address: property.address,
    address_number: property.address_number,
    complement: property.complement,
    neighborhood_name: property.neighborhood,
    city: property.city,
    state: property.state,
    latitude: property.latitude,
    longitude: property.longitude,
    cover_image: property.cover_image,
    characteristics: property.characteristics,
    is_featured: false,
    is_active: false,
    meta_title: property.meta_title,
    meta_description: property.meta_description,
    video_url: property.video_url,
    tour_url: property.tour_url,
  };

  const { error } = await supabase.from("properties").insert(duplicated);
  if (error) throw new Error(error.message);
}

