import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Property, PropertyFloorPlan, PropertyImage } from "../types/property";

const sourceProjectDir = process.env.VISIONMOBIA_PROJECT_DIR ?? "C:/Projetos/Visionmobia";
const targetFile = path.resolve(process.cwd(), "data/properties.json");

loadEnvConfig(sourceProjectDir, false, console, true);

const sourceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sourceAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!sourceUrl || !sourceAnonKey) {
  throw new Error("As credenciais públicas do Supabase do Vision Mobia não foram encontradas.");
}

const supabase = createClient(sourceUrl, sourceAnonKey, {
  auth: { persistSession: false },
});

type SourceImage = {
  id: string;
  property_id: string;
  image_url?: string | null;
  url?: string | null;
  alt_text?: string | null;
  alt?: string | null;
  order_index?: number | null;
  sort_order?: number | null;
  is_cover?: boolean | null;
};

type SourceFloorPlan = {
  id: string;
  property_id: string;
  image_url?: string | null;
  title?: string | null;
  order_index?: number | null;
  sort_order?: number | null;
};

type SourceFeature = {
  name?: string | null;
};

type SourceProperty = Omit<Property, "images" | "floor_plans" | "neighborhood" | "is_launch"> & {
  neighborhood?: string | null;
  neighborhood_name?: string | null;
  property_images?: SourceImage[] | null;
  property_floor_plans?: SourceFloorPlan[] | null;
  property_features?: SourceFeature[] | null;
};

function mapImage(image: SourceImage): PropertyImage | null {
  const url = image.image_url ?? image.url ?? "";
  if (!url) return null;

  return {
    id: image.id,
    property_id: image.property_id,
    url,
    alt: image.alt_text ?? image.alt ?? "",
    sort_order: image.order_index ?? image.sort_order ?? 0,
    is_cover: image.is_cover ?? false,
  };
}

function mapFloorPlan(plan: SourceFloorPlan): PropertyFloorPlan | null {
  const url = plan.image_url ?? "";
  if (!url) return null;

  return {
    id: plan.id,
    property_id: plan.property_id,
    url,
    title: plan.title,
    sort_order: plan.order_index ?? plan.sort_order ?? 0,
  };
}

function mapProperty(item: SourceProperty): Property {
  const relationFeatures = item.property_features
    ?.map((feature) => feature.name)
    .filter((feature): feature is string => Boolean(feature)) ?? [];
  const images = item.property_images
    ?.map(mapImage)
    .filter((image): image is PropertyImage => image !== null)
    .sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const floorPlans = item.property_floor_plans
    ?.map(mapFloorPlan)
    .filter((plan): plan is PropertyFloorPlan => plan !== null)
    .sort((a, b) => a.sort_order - b.sort_order) ?? [];

  const property = { ...item };
  delete property.property_images;
  delete property.property_floor_plans;
  delete property.property_features;
  delete property.neighborhood_name;

  return {
    ...property,
    neighborhood: item.neighborhood_name ?? item.neighborhood ?? "",
    images,
    floor_plans: floorPlans,
    characteristics: item.characteristics?.length ? item.characteristics : relationFeatures,
    property_stage: item.property_stage ?? (item.purpose === "launch" ? "launch" : "ready"),
    is_launch: item.purpose === "launch",
  };
}

async function fetchAllProperties() {
  const pageSize = 500;
  const rows: SourceProperty[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("properties")
      .select("*, property_images(*), property_floor_plans(*), property_features(name)")
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .neq("status", "inactive")
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const page = (data ?? []) as SourceProperty[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return rows.map(mapProperty);
}

async function main() {
  const properties = await fetchAllProperties();

  await mkdir(path.dirname(targetFile), { recursive: true });
  await writeFile(targetFile, `${JSON.stringify(properties, null, 2)}\n`, "utf8");

  const imageCount = properties.reduce((total, property) => total + property.images.length, 0);
  const floorPlanCount = properties.reduce((total, property) => total + (property.floor_plans?.length ?? 0), 0);

  console.log(`Catálogo local atualizado: ${properties.length} imóveis.`);
  console.log(`Imagens referenciadas: ${imageCount}. Plantas referenciadas: ${floorPlanCount}.`);
  console.log(`Arquivo: ${targetFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
