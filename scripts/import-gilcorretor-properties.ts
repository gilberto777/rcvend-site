import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Row = Record<string, unknown>;

type ImportItem = {
  oldId: string;
  newId: string | null;
  slug: string;
  oldUrl: string;
  newUrl: string;
  photos: number;
  floorPlans: number;
  simulated: boolean;
};

type SkipItem = {
  oldId: string;
  slug: string;
  reason: string;
};

type ErrorItem = {
  oldId: string;
  slug: string;
  error: string;
};

const SOURCE_NAME = "Gil Corretor SP";
const SOURCE_SLUG = "gilcorretorsp";
const SOURCE_WEBSITE = "https://gilcorretorsp.com.br";
const TARGET_WEBSITE = "https://www.rcvend.com.br";
const PAGE_SIZE = 500;

function printHelp() {
  console.log(`
Importa imoveis ativos do Gil Corretor SP para o RC Vend.

Uso:
  npm run import:gilcorretor              # simulacao, sem gravar
  npm run import:gilcorretor -- --execute # executa a importacao
  npm run import:gilcorretor -- --slug-report caminho.json # limita aos slugs do relatorio

Variaveis obrigatorias em .env.local:
  OLD_SUPABASE_URL
  OLD_SUPABASE_SERVICE_ROLE_KEY
  NEW_SUPABASE_URL
  NEW_SUPABASE_SERVICE_ROLE_KEY
`);
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function argumentValue(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1]?.trim() : undefined;
}

function slugsFromReport(filePath: string) {
  const data = JSON.parse(readFileSync(path.resolve(filePath), "utf8")) as
    | { items?: Array<{ slug?: unknown }> }
    | Array<{ slug?: unknown }>;
  const items = Array.isArray(data) ? data : (data.items ?? []);
  const slugs = new Set(items.map((item) => text(item.slug)).filter(Boolean));
  if (slugs.size === 0) throw new Error(`Nenhum slug encontrado no relatorio: ${filePath}`);
  return slugs;
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variavel obrigatoria ausente: ${name}`);
  return value;
}

function createAdminClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isMissingRelation(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (["42P01", "PGRST205"].includes(error.code ?? "") ||
        /relation .* does not exist|could not find the table/i.test(error.message ?? "")),
  );
}

function isMissingColumn(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (["42703", "PGRST204"].includes(error.code ?? "") ||
        /column .* does not exist|could not find the .* column/i.test(error.message ?? "")),
  );
}

async function findTable(client: SupabaseClient, candidates: string[]) {
  for (const table of candidates) {
    const { error } = await client.from(table).select("*", { count: "exact", head: true });
    if (!error) return table;
    if (!isMissingRelation(error)) throw new Error(`Falha ao verificar ${table}: ${error.message}`);
  }

  return null;
}

async function assertTable(client: SupabaseClient, table: string) {
  const { error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(`Tabela obrigatoria ${table} indisponivel: ${error.message}`);
}

async function assertColumns(client: SupabaseClient, table: string, columns: string[]) {
  const { error } = await client.from(table).select(columns.join(",")).limit(1);
  if (error) throw new Error(`Schema incompativel em ${table}: ${error.message}`);
}

async function hasColumn(client: SupabaseClient, table: string, column: string) {
  const { error } = await client.from(table).select(column).limit(1);
  if (!error) return true;
  if (isMissingColumn(error)) return false;
  throw new Error(`Falha ao verificar ${table}.${column}: ${error.message}`);
}

async function fetchAll(client: SupabaseClient, table: string, columns = "*") {
  const rows: Row[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler ${table}: ${error.message}`);

    const page = (data ?? []) as unknown as Row[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return rows;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const result = text(value);
  return result || null;
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function nonNegativeNumber(value: unknown, fallback = 0) {
  const result = numberOrNull(value);
  return result !== null && result >= 0 ? result : fallback;
}

function nonNegativeInteger(value: unknown, fallback = 0) {
  return Math.trunc(nonNegativeNumber(value, fallback));
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];

  const trimmed = value.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed.replace(/^\{(.*)\}$/, "[$1]"));
      if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    } catch {
      // Continua para formatos separados por virgula ou pipe.
    }
  }

  return trimmed.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
}

function uniqueStrings(...values: unknown[]) {
  return Array.from(new Set(values.flatMap(toStringArray)));
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalCity(value: unknown) {
  const city = text(value) || "Sao Paulo";
  return slugify(city) === "sao-paulo" ? "Sao Paulo" : city;
}

function canonicalState(value: unknown) {
  const state = text(value).toUpperCase();
  return /^[A-Z]{2}$/.test(state) ? state : "SP";
}

function isActiveProperty(property: Row) {
  if (property.is_active === false) return false;

  const status = text(property.status).toLowerCase();
  if (!status) return true;
  return ["active", "available", "published", "ativo", "disponivel", "disponível"].includes(status);
}

function mapPropertyType(value: unknown) {
  const type = text(value).toLowerCase();
  const aliases: Record<string, string> = {
    apartamento: "apartment",
    casa: "house",
    cobertura: "penthouse",
    comercial: "commercial",
    terreno: "land",
  };
  const mapped = aliases[type] ?? type;
  return ["apartment", "studio", "house", "penthouse", "land", "commercial"].includes(mapped)
    ? mapped
    : "apartment";
}

function mapPurpose(property: Row) {
  const purpose = text(property.purpose ?? property.business_type).toLowerCase();
  if (["rent", "rental", "aluguel", "locacao", "locação"].includes(purpose)) return "rent";
  if (purpose === "launch") return "launch";
  return "sale";
}

function mapPropertyStage(property: Row) {
  const stage = text(property.property_stage).toLowerCase();
  if (["launch", "under_construction", "ready"].includes(stage)) return stage;
  return mapPurpose(property) === "launch" ? "launch" : "ready";
}

function propertyId(row: Row) {
  return text(row.id);
}

function imageUrl(row: Row) {
  return text(row.url ?? row.image_url);
}

function parseLegacyImages(property: Row): Row[] {
  return toStringArray(property.images).map((url, index) => ({
    id: `${propertyId(property)}-legacy-${index}`,
    property_id: propertyId(property),
    url,
    alt_text: property.title,
    order_index: index,
    is_cover: index === 0,
    image_type: "photo",
    created_at: property.created_at,
  } satisfies Row));
}

function buildPropertyPayload(
  property: Row,
  organizationId: string | null,
  neighborhoodId: string | null,
  photos: Row[],
  targetHasSource: boolean,
  targetHasPropertyStage: boolean,
) {
  const title = text(property.title);
  const slug = text(property.slug);
  if (!title) throw new Error("Titulo ausente");
  if (!slug) throw new Error("Slug ausente; o link antigo nao pode ser preservado");

  const price = numberOrNull(property.price);
  if (price === null || price < 0) throw new Error("Preco ausente ou invalido");

  const cover = photos.find((image) => Boolean(image.is_cover)) ?? photos[0];
  const payload: Row = {
    organization_id: organizationId,
    agent_id: null,
    developer_id: null,
    neighborhood_id: neighborhoodId,
    title,
    slug,
    description: text(property.description) || title,
    purpose: mapPurpose(property),
    type: mapPropertyType(property.type),
    status: "available",
    approval_status: "approved",
    price,
    condo_fee: numberOrNull(property.condo_fee),
    iptu: numberOrNull(property.iptu),
    area: nonNegativeNumber(property.area_total ?? property.area_useful ?? property.area),
    bedrooms: nonNegativeInteger(property.bedrooms),
    bathrooms: nonNegativeInteger(property.bathrooms),
    suites: nonNegativeInteger(property.suites),
    parking_spaces: nonNegativeInteger(property.parking_spaces),
    address: nullableText(property.address_full ?? property.address),
    address_number: nullableText(property.address_number),
    complement: nullableText(property.complement),
    neighborhood_name: text(property.neighborhood ?? property.neighborhood_name) || "Nao informado",
    city: canonicalCity(property.city),
    state: canonicalState(property.state),
    latitude: numberOrNull(property.latitude ?? property.lat),
    longitude: numberOrNull(property.longitude ?? property.lng),
    cover_image: cover ? imageUrl(cover) : null,
    characteristics: uniqueStrings(property.features, property.highlights, property.smart_tags),
    is_featured: Boolean(property.is_featured ?? property.featured),
    is_active: true,
    meta_title: nullableText(property.meta_title ?? property.og_title),
    meta_description: nullableText(property.meta_description ?? property.og_description),
    video_url: nullableText(property.video_url),
    tour_url: nullableText(property.tour_url),
    created_at: nullableText(property.created_at) ?? new Date().toISOString(),
    updated_at: nullableText(property.updated_at) ?? new Date().toISOString(),
  };

  if (targetHasSource) payload.source = SOURCE_SLUG;
  if (targetHasPropertyStage) payload.property_stage = mapPropertyStage(property);
  return payload;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

async function ensureOrganization(client: SupabaseClient, execute: boolean) {
  const { data, error } = await client
    .from("organizations")
    .select("id,slug")
    .eq("slug", SOURCE_SLUG)
    .maybeSingle();

  if (error) throw new Error(`Falha ao buscar organizacao de origem: ${error.message}`);
  if (data?.id) return { id: String(data.id), created: false };
  if (!execute) return { id: null, created: true };

  const result = await client
    .from("organizations")
    .insert({
      name: SOURCE_NAME,
      slug: SOURCE_SLUG,
      type: "independent_agent",
      website: SOURCE_WEBSITE,
      city: "Sao Paulo",
      state: "SP",
      status: "active",
    })
    .select("id")
    .single();

  if (result.error) throw new Error(`Falha ao criar organizacao de origem: ${result.error.message}`);
  return { id: String(result.data.id), created: true };
}

function neighborhoodKey(slug: string, city: string, state: string) {
  return `${slug}|${slugify(city)}|${state.toUpperCase()}`;
}

async function loadNeighborhoodCache(client: SupabaseClient) {
  const rows = await fetchAll(client, "neighborhoods", "id,slug,city,state");
  return new Map(
    rows.map((row) => {
      const city = canonicalCity(row.city);
      const state = canonicalState(row.state);
      return [neighborhoodKey(text(row.slug), city, state), text(row.id)] as const;
    }),
  );
}

async function ensureNeighborhood(
  client: SupabaseClient,
  cache: Map<string, string>,
  property: Row,
  execute: boolean,
) {
  const name = text(property.neighborhood ?? property.neighborhood_name);
  if (!name) return { id: null, created: false };

  const slug = slugify(name);
  const city = canonicalCity(property.city);
  const state = canonicalState(property.state);
  const key = neighborhoodKey(slug, city, state);
  const existingId = cache.get(key);
  if (existingId) return { id: existingId, created: false };
  if (!execute) return { id: null, created: true };

  const result = await client
    .from("neighborhoods")
    .insert({ name, slug, city, state, is_active: true })
    .select("id")
    .single();

  if (result.error) {
    const retry = await client
      .from("neighborhoods")
      .select("id")
      .eq("slug", slug)
      .eq("city", city)
      .eq("state", state)
      .maybeSingle();
    if (retry.error || !retry.data?.id) {
      throw new Error(`Falha ao criar bairro ${name}: ${result.error.message}`);
    }
    cache.set(key, String(retry.data.id));
    return { id: String(retry.data.id), created: false };
  }

  const id = String(result.data.id);
  cache.set(key, id);
  return { id, created: true };
}

async function insertImageRows(client: SupabaseClient, table: string, rows: Row[]) {
  for (const batch of chunk(rows, 100)) {
    const { error } = await client.from(table).insert(batch);
    if (error) throw new Error(`Falha ao inserir em ${table}: ${error.message}`);
  }
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  loadEnvFile(path.join(process.cwd(), ".env.local"));
  const execute = process.argv.includes("--execute");
  const slugReport = argumentValue("--slug-report");
  const requestedSlugs = slugReport ? slugsFromReport(slugReport) : null;
  const startedAt = new Date();

  const oldClient = createAdminClient(
    requireEnv("OLD_SUPABASE_URL"),
    requireEnv("OLD_SUPABASE_SERVICE_ROLE_KEY"),
  );
  const newClient = createAdminClient(
    requireEnv("NEW_SUPABASE_URL"),
    requireEnv("NEW_SUPABASE_SERVICE_ROLE_KEY"),
  );

  console.log(execute ? "MODO EXECUCAO: o RC Vend sera alterado." : "MODO SIMULACAO: nenhuma gravacao sera feita.");

  const oldPropertiesTable = await findTable(oldClient, ["properties", "imoveis"]);
  const oldImagesTable = await findTable(oldClient, ["property_images", "imagens"]);
  const oldNeighborhoodsTable = await findTable(oldClient, ["neighborhoods", "bairros"]);
  const oldLeadsTable = await findTable(oldClient, ["leads"]);

  if (!oldPropertiesTable) throw new Error("Nenhuma tabela de imoveis encontrada no Supabase antigo");

  for (const table of ["properties", "property_images", "property_floor_plans", "neighborhoods", "organizations", "profiles"]) {
    await assertTable(newClient, table);
  }

  await assertColumns(newClient, "properties", [
    "id",
    "slug",
    "organization_id",
    "neighborhood_id",
    "approval_status",
    "status",
    "is_active",
  ]);
  await assertColumns(newClient, "property_images", ["property_id", "image_url", "order_index", "is_cover"]);

  const targetHasSource = await hasColumn(newClient, "properties", "source");
  const targetHasPropertyStage = await hasColumn(newClient, "properties", "property_stage");
  const allOldProperties = await fetchAll(oldClient, oldPropertiesTable);
  const activeProperties = allOldProperties.filter(
    (property) => isActiveProperty(property) && (!requestedSlugs || requestedSlugs.has(text(property.slug))),
  );
  if (requestedSlugs && activeProperties.length !== requestedSlugs.size) {
    throw new Error(
      `Relatorio possui ${requestedSlugs.size} slugs, mas ${activeProperties.length} imoveis ativos foram encontrados na origem`,
    );
  }
  const activeIds = new Set(activeProperties.map(propertyId).filter(Boolean));
  const allOldImages = oldImagesTable ? await fetchAll(oldClient, oldImagesTable) : [];
  const relevantImages = allOldImages.filter((image) => activeIds.has(text(image.property_id)) && imageUrl(image));

  const imagesByProperty = new Map<string, Row[]>();
  for (const image of relevantImages) {
    const id = text(image.property_id);
    const list = imagesByProperty.get(id) ?? [];
    list.push(image);
    imagesByProperty.set(id, list);
  }
  for (const list of imagesByProperty.values()) {
    list.sort((a, b) => nonNegativeInteger(a.order_index) - nonNegativeInteger(b.order_index));
  }

  const targetProperties = await fetchAll(newClient, "properties", "slug");
  const existingSlugs = new Set(targetProperties.map((row) => text(row.slug)).filter(Boolean));
  const organization = await ensureOrganization(newClient, execute);
  const neighborhoodCache = await loadNeighborhoodCache(newClient);

  const imported: ImportItem[] = [];
  const skipped: SkipItem[] = [];
  const errors: ErrorItem[] = [];
  const createdNeighborhoods = new Set<string>();

  for (const property of activeProperties) {
    const oldId = propertyId(property);
    const slug = text(property.slug);

    if (!oldId || !slug) {
      errors.push({ oldId, slug, error: "ID ou slug ausente" });
      continue;
    }

    if (existingSlugs.has(slug)) {
      if (targetHasPropertyStage && execute) {
        const { error } = await newClient
          .from("properties")
          .update({ property_stage: mapPropertyStage(property) })
          .eq("slug", slug);
        if (error) {
          errors.push({ oldId, slug, error: `Falha ao sincronizar fase do imovel: ${error.message}` });
          continue;
        }
      }

      skipped.push({
        oldId,
        slug,
        reason: targetHasPropertyStage
          ? execute
            ? "slug ja existe; fase do imovel sincronizada"
            : "slug ja existe; fase do imovel seria sincronizada"
          : "slug ja existe no RC Vend",
      });
      continue;
    }

    try {
      const neighborhood = await ensureNeighborhood(newClient, neighborhoodCache, property, execute);
      if (neighborhood.created) createdNeighborhoods.add(slugify(text(property.neighborhood)));

      const sourceImages = imagesByProperty.get(oldId) ?? parseLegacyImages(property);
      const photos = sourceImages.filter((image) => text(image.image_type || "photo") !== "floor_plan");
      const floorPlans = sourceImages.filter((image) => text(image.image_type) === "floor_plan");
      const payload = buildPropertyPayload(property, organization.id, neighborhood.id, photos, targetHasSource, targetHasPropertyStage);

      if (!execute) {
        imported.push({
          oldId,
          newId: null,
          slug,
          oldUrl: `${SOURCE_WEBSITE}/imoveis/${slug}`,
          newUrl: `${TARGET_WEBSITE}/imoveis/${slug}`,
          photos: photos.length,
          floorPlans: floorPlans.length,
          simulated: true,
        });
        continue;
      }

      const inserted = await newClient.from("properties").insert(payload).select("id").single();
      if (inserted.error) throw new Error(`Falha ao inserir imovel: ${inserted.error.message}`);

      const newId = String(inserted.data.id);
      try {
        await insertImageRows(
          newClient,
          "property_images",
          photos.map((image, index) => ({
            property_id: newId,
            image_url: imageUrl(image),
            storage_path: null,
            alt_text: nullableText(image.alt_text) ?? text(property.title),
            order_index: nonNegativeInteger(image.order_index, index),
            is_cover: Boolean(image.is_cover) || (!photos.some((item) => Boolean(item.is_cover)) && index === 0),
            created_at: nullableText(image.created_at) ?? new Date().toISOString(),
          })),
        );

        await insertImageRows(
          newClient,
          "property_floor_plans",
          floorPlans.map((image, index) => ({
            property_id: newId,
            image_url: imageUrl(image),
            storage_path: null,
            title: nullableText(image.alt_text) ?? `Planta ${index + 1}`,
            order_index: index,
            created_at: nullableText(image.created_at) ?? new Date().toISOString(),
          })),
        );
      } catch (error) {
        await newClient.from("properties").delete().eq("id", newId);
        throw error;
      }

      existingSlugs.add(slug);
      imported.push({
        oldId,
        newId,
        slug,
        oldUrl: `${SOURCE_WEBSITE}/imoveis/${slug}`,
        newUrl: `${TARGET_WEBSITE}/imoveis/${slug}`,
        photos: photos.length,
        floorPlans: floorPlans.length,
        simulated: false,
      });
      console.log(`IMPORTADO ${slug} (${photos.length} fotos, ${floorPlans.length} plantas)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ oldId, slug, error: message });
      console.error(`ERRO ${slug}: ${message}`);
    }
  }

  const finishedAt = new Date();
  const report = {
    mode: execute ? "execute" : "dry-run",
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    source: {
      propertiesTable: oldPropertiesTable,
      imagesTable: oldImagesTable,
      neighborhoodsTable: oldNeighborhoodsTable,
      leadsTable: oldLeadsTable,
      totalProperties: allOldProperties.length,
      activeProperties: activeProperties.length,
      images: relevantImages.length,
      leadsMigrated: 0,
    },
    target: {
      existingProperties: targetProperties.length,
      sourceColumnUsed: targetHasSource,
      organization: {
        slug: SOURCE_SLUG,
        id: organization.id,
        createdOrWouldCreate: organization.created,
      },
      neighborhoodsCreatedOrWouldCreate: Array.from(createdNeighborhoods).filter(Boolean).sort(),
    },
    summary: {
      imported: imported.length,
      skipped: skipped.length,
      errors: errors.length,
    },
    imported,
    skipped,
    errors,
  };

  const reportsDirectory = path.join(process.cwd(), "reports");
  mkdirSync(reportsDirectory, { recursive: true });
  const timestamp = finishedAt.toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(reportsDirectory, `import-gilcorretor-properties-${timestamp}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("\nRESUMO");
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`Leads migrados: 0`);
  console.log(`Relatorio: ${reportPath}`);

  if (errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
