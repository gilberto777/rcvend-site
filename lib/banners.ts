import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { PromotionalBanner } from "@/types/banner";

const localCatalogPath = path.join(process.cwd(), "data", "banners.json");

function isVisibleNow(banner: PromotionalBanner, now = Date.now()) {
  if (!banner.is_active) return false;
  if (banner.starts_at && Date.parse(banner.starts_at) > now) return false;
  if (banner.ends_at && Date.parse(banner.ends_at) < now) return false;
  return true;
}

async function readLocalBanners() {
  try {
    return JSON.parse(await readFile(localCatalogPath, "utf8")) as PromotionalBanner[];
  } catch {
    return [] as PromotionalBanner[];
  }
}

export async function getActiveBanners() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return (await readLocalBanners())
      .filter((banner) => isVisibleNow(banner))
      .sort((left, right) => left.sort_order - right.sort_order);
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("promotional_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return (await readLocalBanners())
      .filter((banner) => isVisibleNow(banner))
      .sort((left, right) => left.sort_order - right.sort_order);
  }

  return (data as PromotionalBanner[]).filter((banner) => isVisibleNow(banner));
}
