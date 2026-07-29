import type { LeadStatus, PropertyPurpose, PropertyStage, PropertyStatus, PropertyType } from "@/types/property";

export const purposeLabels: Record<PropertyPurpose, string> = {
  sale: "Venda",
  rent: "Aluguel",
  launch: "Lançamento",
};

export const propertyStageLabels: Record<PropertyStage, string> = {
  launch: "Lançamento",
  under_construction: "Em construção",
  ready: "Pronto para morar",
};

export const statusLabels: Record<PropertyStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
  rented: "Alugado",
  inactive: "Inativo",
};

export const typeLabels: Record<PropertyType, string> = {
  apartment: "Apartamento",
  studio: "Studio",
  house: "Casa",
  penthouse: "Cobertura",
  commercial: "Comercial",
  land: "Terreno",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Em atendimento",
  visiting: "Visita agendada",
  proposal: "Proposta",
  converted: "Convertido",
  lost: "Perdido",
};

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getStatusTone(status: PropertyStatus | LeadStatus | "active" | "inactive" | "featured") {
  if (status === "available" || status === "active" || status === "converted" || status === "featured") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "reserved" || status === "contacted" || status === "visiting" || status === "proposal") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "sold" || status === "rented" || status === "lost") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

