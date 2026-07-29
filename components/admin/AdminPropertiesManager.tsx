"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, Eye, Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { getStatusTone, propertyStageLabels, purposeLabels, statusLabels, typeLabels } from "@/lib/admin/labels";
import { deleteProperty, duplicateProperty, listAdminProperties, updatePropertyState } from "@/lib/admin/client-data";
import { formatDisplayText, formatPropertyPrice } from "@/lib/formatters";
import type { ApprovalStatus, Property, PropertyPurpose, PropertyStage, PropertyStatus, PropertyType } from "@/types/property";

type ActiveFilter = "all" | "active" | "inactive";
type FeaturedFilter = "all" | "featured" | "normal";
type OriginFilter = "all" | "partner" | "portal";

export function AdminPropertiesManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PropertyStatus | "all">("all");
  const [purpose, setPurpose] = useState<PropertyPurpose | "all">("all");
  const [stage, setStage] = useState<PropertyStage | "all">("all");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");
  const [active, setActive] = useState<ActiveFilter>("all");
  const [neighborhood, setNeighborhood] = useState("all");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [approval, setApproval] = useState<ApprovalStatus | "all">("all");

  const neighborhoods = useMemo(
    () => Array.from(new Set(properties.map((property) => property.neighborhood).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [properties],
  );

  async function refresh(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      setProperties(await listAdminProperties());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar imóveis.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    listAdminProperties()
      .then((data) => {
        if (!ignore) setProperties(data);
      })
      .catch((error: unknown) => {
        if (!ignore) setMessage(error instanceof Error ? error.message : "Não foi possível carregar imóveis.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        !term ||
        [property.code ?? "", property.title, property.neighborhood, property.city].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesStatus = status === "all" || property.status === status;
      const matchesPurpose = purpose === "all" || property.purpose === purpose;
      const matchesStage = stage === "all" || property.property_stage === stage;
      const matchesType = type === "all" || property.type === type;
      const matchesFeatured = featured === "all" || (featured === "featured" ? property.is_featured : !property.is_featured);
      const matchesActive = active === "all" || (active === "active" ? property.is_active : !property.is_active);
      const matchesNeighborhood = neighborhood === "all" || property.neighborhood === neighborhood;
      const hasPartnerOrigin = Boolean(property.organization_id || property.agent_id || property.developer_id);
      const matchesOrigin = origin === "all" || (origin === "partner" ? hasPartnerOrigin : !hasPartnerOrigin);
      const matchesApproval = approval === "all" || property.approval_status === approval;

      return matchesSearch && matchesStatus && matchesPurpose && matchesStage && matchesType && matchesFeatured && matchesActive && matchesNeighborhood && matchesOrigin && matchesApproval;
    });
  }, [active, approval, featured, neighborhood, origin, properties, purpose, q, stage, status, type]);

  async function handleToggle(property: Property) {
    await updatePropertyState(property.id, { is_active: !property.is_active });
    setMessage(property.is_active ? "Imóvel desativado." : "Imóvel ativado.");
    await refresh();
  }

  async function handleDuplicate(property: Property) {
    await duplicateProperty(property);
    setMessage("Imóvel duplicado como rascunho inativo.");
    await refresh();
  }

  async function handleDelete(property: Property) {
    if (!confirm(`Excluir o imóvel "${property.title}"? Esta ação não pode ser desfeita.`)) return;
    await deleteProperty(property.id);
    setMessage("Imóvel excluído.");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-brand-strong p-6 text-white shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Gestão de catálogo</p>
          <h2 className="mt-2 text-3xl font-black">Imóveis</h2>
          <p className="mt-2 max-w-2xl text-white/70">
            Busque, filtre e gerencie anúncios publicados, rascunhos, destaques e lançamentos.
          </p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-black text-brand-strong hover:bg-white"
        >
          <Plus className="h-5 w-5" />
          Novo imóvel
        </Link>
      </section>

      <section className="rounded-3xl border border-line bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3 md:col-span-2 xl:col-span-2">
            <Search className="h-5 w-5 text-brand" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar por título, bairro ou cidade"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <FilterSelect label="Finalidade" value={purpose} onChange={(value) => setPurpose(value as PropertyPurpose | "all")}>
            {Object.entries(purposeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Fase do imóvel" value={stage} onChange={(value) => setStage(value as PropertyStage | "all")}>
            {Object.entries(propertyStageLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Tipo" value={type} onChange={(value) => setType(value as PropertyType | "all")}>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Status" value={status} onChange={(value) => setStatus(value as PropertyStatus | "all")}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect label="Destaque" value={featured} onChange={(value) => setFeatured(value as FeaturedFilter)}>
            <option value="featured">Destaques</option>
            <option value="normal">Sem destaque</option>
          </FilterSelect>
          <FilterSelect label="Ativo/Inativo" value={active} onChange={(value) => setActive(value as ActiveFilter)}>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </FilterSelect>
          <FilterSelect label="Bairro" value={neighborhood} onChange={setNeighborhood}>
            {neighborhoods.map((item) => <option key={item} value={item}>{item}</option>)}
          </FilterSelect>
          <FilterSelect label="Origem" value={origin} onChange={(value) => setOrigin(value as OriginFilter)}>
            <option value="partner">Parceiros</option>
            <option value="portal">Cadastro interno</option>
          </FilterSelect>
          <FilterSelect label="Aprovação" value={approval} onChange={(value) => setApproval(value as ApprovalStatus | "all")}>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </FilterSelect>
        </div>
      </section>

      {message && <p className="rounded-2xl border border-line bg-white p-4 text-sm font-bold text-brand">{message}</p>}

      <DesktopTable
        loading={loading}
        properties={filtered}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggle={handleToggle}
      />

      <MobileCards
        loading={loading}
        properties={filtered}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggle={handleToggle}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-w-0 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-bold"
      aria-label={label}
    >
      <option value="all">{label}</option>
      {children}
    </select>
  );
}

function DesktopTable({
  loading,
  properties,
  onDelete,
  onDuplicate,
  onToggle,
}: {
  loading: boolean;
  properties: Property[];
  onDelete: (property: Property) => Promise<void>;
  onDuplicate: (property: Property) => Promise<void>;
  onToggle: (property: Property) => Promise<void>;
}) {
  return (
    <section className="hidden overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1450px] text-left text-sm">
          <thead className="bg-background text-muted">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Imóvel</th>
              <th className="p-4">Local</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Finalidade</th>
              <th className="p-4">Fase</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Status</th>
              <th className="p-4">Publicação</th>
              <th className="sticky right-0 z-10 min-w-60 border-l border-line bg-background p-4 shadow-[-12px_0_18px_-16px_rgba(5,56,52,0.35)]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="p-8 text-center text-muted">Carregando imóveis...</td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-muted">Nenhum imóvel encontrado.</td></tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="border-t border-line align-middle">
                  <td className="p-4">
                    <span title={property.code ?? property.id} className="block max-w-28 truncate rounded-xl border border-line bg-background px-3 py-2 font-black text-brand">
                      {property.code ?? "Automático"}
                    </span>
                  </td>
                  <td className="p-4">
                    <PropertySummary property={property} />
                  </td>
                  <td className="p-4 text-muted">{formatDisplayText(property.neighborhood)}, {formatDisplayText(property.city)}</td>
                  <td className="p-4 font-black text-brand">{formatPropertyPrice(property)}</td>
                  <td className="p-4"><AdminBadge tone="brand">{purposeLabels[property.purpose]}</AdminBadge></td>
                  <td className="p-4"><AdminBadge tone="neutral">{propertyStageLabels[property.property_stage]}</AdminBadge></td>
                  <td className="p-4">{typeLabels[property.type]}</td>
                  <td className="p-4"><AdminBadge tone={getStatusTone(property.status)}>{statusLabels[property.status]}</AdminBadge></td>
                  <td className="p-4"><PublicationBadges property={property} /></td>
                  <td className="sticky right-0 z-10 min-w-60 border-l border-line bg-white p-4 shadow-[-12px_0_18px_-16px_rgba(5,56,52,0.35)]">
                    <PropertyActions property={property} onDelete={onDelete} onDuplicate={onDuplicate} onToggle={onToggle} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MobileCards({
  loading,
  properties,
  onDelete,
  onDuplicate,
  onToggle,
}: {
  loading: boolean;
  properties: Property[];
  onDelete: (property: Property) => Promise<void>;
  onDuplicate: (property: Property) => Promise<void>;
  onToggle: (property: Property) => Promise<void>;
}) {
  if (loading) {
    return <p className="rounded-3xl border border-line bg-white p-6 text-center text-sm text-muted md:hidden">Carregando imóveis...</p>;
  }

  if (properties.length === 0) {
    return <p className="rounded-3xl border border-line bg-white p-6 text-center text-sm text-muted md:hidden">Nenhum imóvel encontrado.</p>;
  }

  return (
    <section className="grid gap-4 md:hidden">
      {properties.map((property) => (
        <article key={property.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <div className="relative aspect-[4/3] bg-line">
            <Image src={property.cover_image} alt={property.title} fill sizes="100vw" className="object-cover" />
          </div>
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-line bg-background px-3 py-2 text-xs font-black text-brand">
                {property.code ?? "Automático"}
              </span>
              <AdminBadge tone="brand">{purposeLabels[property.purpose]}</AdminBadge>
              <AdminBadge tone="neutral">{propertyStageLabels[property.property_stage]}</AdminBadge>
              <AdminBadge tone={getStatusTone(property.status)}>{statusLabels[property.status]}</AdminBadge>
            </div>
            <div>
              <h3 className="text-lg font-black">{formatDisplayText(property.title)}</h3>
              <p className="mt-1 text-sm text-muted">{formatDisplayText(property.neighborhood)}, {formatDisplayText(property.city)}</p>
              <p className="mt-3 text-xl font-black text-brand">{formatPropertyPrice(property)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminBadge tone="neutral">{typeLabels[property.type]}</AdminBadge>
              <PublicationBadges property={property} />
            </div>
            <PropertyActions property={property} onDelete={onDelete} onDuplicate={onDuplicate} onToggle={onToggle} mobile />
          </div>
        </article>
      ))}
    </section>
  );
}

function PropertySummary({ property }: { property: Property }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-line">
        <Image src={property.cover_image} alt={formatDisplayText(property.title)} fill sizes="80px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="font-black">{formatDisplayText(property.title)}</p>
        <p className="max-w-[260px] truncate text-xs text-muted">{property.slug}</p>
      </div>
    </div>
  );
}

function PublicationBadges({ property }: { property: Property }) {
  return (
    <div className="flex flex-wrap gap-2">
      <AdminBadge tone={property.is_active ? "success" : "danger"}>{property.is_active ? "Ativo" : "Inativo"}</AdminBadge>
      {property.is_featured && <AdminBadge tone="success">Destaque</AdminBadge>}
      {property.approval_status ? <AdminBadge tone={property.approval_status === "approved" ? "success" : property.approval_status === "pending" ? "warning" : "danger"}>{property.approval_status === "approved" ? "Aprovado" : property.approval_status === "pending" ? "Pendente" : "Rejeitado"}</AdminBadge> : null}
    </div>
  );
}

function PropertyActions({
  property,
  onDelete,
  onDuplicate,
  onToggle,
  mobile,
}: {
  property: Property;
  onDelete: (property: Property) => Promise<void>;
  onDuplicate: (property: Property) => Promise<void>;
  onToggle: (property: Property) => Promise<void>;
  mobile?: boolean;
}) {
  const buttonClass = mobile
    ? "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line px-3 py-3 text-sm font-black text-brand hover:border-brand"
    : "grid h-9 w-9 place-items-center rounded-xl border border-line text-brand hover:border-brand";
  const deleteClass = mobile
    ? "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-3 text-sm font-black text-red-700 hover:bg-red-50"
    : "grid h-9 w-9 place-items-center rounded-xl border border-red-200 text-red-700 hover:bg-red-50";

  return (
    <div className={`flex ${mobile ? "flex-wrap" : "items-center"} gap-2`}>
      <Link title="Ver no site" href={`/imoveis/${property.slug}`} className={buttonClass}>
        <Eye className="h-4 w-4" />
        {mobile && "Ver"}
      </Link>
      <Link title="Editar" href={`/admin/imoveis/${property.id}/editar`} className={buttonClass}>
        <Pencil className="h-4 w-4" />
        {mobile && "Editar"}
      </Link>
      <button title="Duplicar" onClick={() => void onDuplicate(property)} className={buttonClass}>
        <Copy className="h-4 w-4" />
        {mobile && "Duplicar"}
      </button>
      <button title="Ativar/desativar" onClick={() => void onToggle(property)} className={buttonClass}>
        <Power className="h-4 w-4" />
        {mobile && (property.is_active ? "Desativar" : "Ativar")}
      </button>
      <button title="Excluir" onClick={() => void onDelete(property)} className={deleteClass}>
        <Trash2 className="h-4 w-4" />
        {mobile && "Excluir"}
      </button>
    </div>
  );
}
