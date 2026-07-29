import catalogProperties from "@/data/properties.json";
import { sampleProperties } from "@/lib/mock-data";
import { getPropertyPrograms } from "@/lib/property-programs";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Lead, Neighborhood, Property, PropertyFilters, PropertyFloorPlan, PropertyImage } from "@/types/property";

function normalize(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const localProperties = (catalogProperties as unknown as Property[]).length
  ? (catalogProperties as unknown as Property[])
  : sampleProperties;

function applyLocalFilters(properties: Property[], filters: PropertyFilters = {}) {
  let result = properties.filter((property) => property.is_active && property.status !== "inactive" && property.approval_status !== "rejected" && property.approval_status !== "pending");

  if (filters.q) {
    const q = normalize(filters.q);
    result = result.filter((property) =>
      [
        property.title,
        property.slug,
        property.description,
        property.neighborhood,
        property.city,
        property.type,
        property.developer ?? "",
        property.meta_title ?? "",
        property.meta_description ?? "",
        ...property.characteristics,
      ]
        .map(normalize)
        .some((field) => field.includes(q)),
    );
  }

  if (filters.purpose && filters.purpose !== "all") {
    result = result.filter((property) => property.purpose === filters.purpose);
  }

  if (filters.stage && filters.stage !== "all") {
    result = result.filter((property) => property.property_stage === filters.stage);
  }

  if (filters.type && filters.type !== "all") {
    result = result.filter((property) => property.type === filters.type);
  }

  if (filters.city) {
    result = result.filter((property) => normalize(property.city) === normalize(filters.city));
  }

  if (filters.neighborhood) {
    result = result.filter((property) => normalize(property.neighborhood) === normalize(filters.neighborhood));
  }

  const program = filters.program;
  if (program && program !== "all") {
    result = result.filter((property) => getPropertyPrograms(property).includes(program));
  }

  switch (filters.sort) {
    case "price_asc":
      return result.sort((a, b) => a.price - b.price);
    case "price_desc":
      return result.sort((a, b) => b.price - a.price);
    case "area_desc":
      return result.sort((a, b) => b.area - a.area);
    default:
      return result.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }
}

type SupabasePropertyImage = {
  id: string;
  property_id: string;
  image_url?: string | null;
  url?: string | null;
  storage_path?: string | null;
  alt_text?: string | null;
  alt?: string | null;
  order_index?: number | null;
  sort_order?: number | null;
  is_cover: boolean;
  created_at: string;
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

function mapPropertyImage(image: SupabasePropertyImage): PropertyImage {
  return {
    id: image.id,
    property_id: image.property_id,
    url: image.image_url ?? image.url ?? "",
    alt: image.alt_text ?? image.alt ?? "",
    sort_order: image.order_index ?? image.sort_order ?? 0,
    is_cover: image.is_cover,
  };
}

function mapPropertyFloorPlan(plan: SupabasePropertyFloorPlan): PropertyFloorPlan {
  return {
    id: plan.id,
    property_id: plan.property_id,
    url: plan.image_url ?? "",
    title: plan.title,
    sort_order: plan.order_index ?? plan.sort_order ?? 0,
  };
}

function mapPropertyFromSupabase(item: SupabasePropertyRow): Property {
  const features = item.property_features?.map((feature) => feature.name).filter(Boolean) ?? [];
  const images = item.property_images
    ?.map(mapPropertyImage)
    .filter((image) => image.url)
    .sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const floorPlans = item.property_floor_plans
    ?.map(mapPropertyFloorPlan)
    .filter((plan) => plan.url)
    .sort((a, b) => a.sort_order - b.sort_order) ?? [];

  return {
    ...item,
    neighborhood: item.neighborhood_name ?? item.neighborhood ?? "",
    images,
    floor_plans: floorPlans,
    characteristics: item.characteristics?.length ? item.characteristics : features,
    property_stage: item.property_stage ?? (item.purpose === "launch" ? "launch" : "ready"),
    is_launch: item.purpose === "launch",
  };
}

export async function getProperties(filters: PropertyFilters = {}) {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return applyLocalFilters([...localProperties], filters);
  }

  let query = supabase
    .from("properties")
    .select("*, property_images(*), property_floor_plans(*), property_features(name)")
    .eq("is_active", true)
    .eq("approval_status", "approved")
    .neq("status", "inactive");

  if (filters.purpose && filters.purpose !== "all") query = query.eq("purpose", filters.purpose);
  if (filters.stage && filters.stage !== "all") query = query.eq("property_stage", filters.stage);
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.city) query = query.ilike("city", filters.city);
  if (filters.neighborhood) query = query.ilike("neighborhood_name", filters.neighborhood);
  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,neighborhood_name.ilike.%${filters.q}%,city.ilike.%${filters.q}%`);
  }

  const order =
    filters.sort === "price_asc"
      ? { column: "price", ascending: true }
      : filters.sort === "price_desc"
        ? { column: "price", ascending: false }
        : filters.sort === "area_desc"
          ? { column: "area", ascending: false }
          : { column: "created_at", ascending: false };

  const { data, error } = await query.order(order.column, { ascending: order.ascending });
  if (error || !data) return applyLocalFilters([...sampleProperties], filters);

  return applyLocalFilters((data as SupabasePropertyRow[]).map(mapPropertyFromSupabase), filters);
}

export async function getFeaturedProperties() {
  const properties = await getProperties();
  return properties.filter((property) => property.is_featured).slice(0, 8);
}

export async function getLaunches() {
  const properties = await getProperties();
  return properties.filter((property) => property.is_launch || property.purpose === "launch").slice(0, 6);
}

export async function getPropertyBySlug(slug: string) {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return localProperties.find((property) => property.slug === slug && property.is_active) ?? null;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*), property_floor_plans(*), property_features(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("approval_status", "approved")
    .single();

  if (error || !data) {
    return localProperties.find((property) => property.slug === slug && property.is_active) ?? null;
  }

  return mapPropertyFromSupabase(data as SupabasePropertyRow);
}

export async function getNeighborhoods() {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return Array.from(
      new Map(
        localProperties.map((property) => [
          `${property.city}-${property.state}-${property.neighborhood}`,
          {
            id: `${property.city}-${property.state}-${property.neighborhood}`,
            name: property.neighborhood,
            slug: normalize(property.neighborhood).replace(/\s+/g, "-"),
            city: property.city,
            state: property.state,
            description: null,
            image_url: null,
            meta_title: null,
            meta_description: null,
            is_active: true,
            created_at: property.created_at,
            updated_at: property.updated_at,
          } satisfies Neighborhood,
        ]),
      ).values(),
    );
  }

  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as Neighborhood[];
}

export async function createLead(input: {
  property_id?: string | null;
  organization_id?: string | null;
  agent_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  message?: string | null;
  source?: string;
}) {
  const supabase = createSupabaseClient();
  if (!supabase) return { ok: true, mode: "local" as const };

  const { error } = await supabase.from("leads").insert({
    property_id: input.property_id,
    organization_id: input.organization_id,
    agent_id: input.agent_id,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    whatsapp: input.whatsapp ?? input.phone,
    message: input.message,
    source: input.source ?? "site",
  } satisfies Partial<Lead>);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
