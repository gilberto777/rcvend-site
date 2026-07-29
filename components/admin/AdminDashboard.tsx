"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Home, MapPinned, MessageCircle, Star, UserRound } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { formatDateTime, purposeLabels, statusLabels } from "@/lib/admin/labels";
import { listAdminLeads, listAdminProperties, type AdminLead } from "@/lib/admin/client-data";
import type { Property } from "@/types/property";

type StatCard = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
};

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [propertyData, leadData] = await Promise.all([listAdminProperties(), listAdminLeads()]);
        setProperties(propertyData);
        setLeads(leadData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const stats = useMemo<StatCard[]>(() => {
    const neighborhoods = new Set(properties.map((property) => `${property.city}-${property.neighborhood}`));

    return [
      { label: "Total de imóveis", value: properties.length, icon: Building2 },
      { label: "Imóveis ativos", value: properties.filter((property) => property.is_active).length, icon: Home },
      { label: "Imóveis pendentes", value: properties.filter((property) => property.approval_status === "pending").length, icon: Building2 },
      { label: "Leads recebidos", value: leads.length, icon: MessageCircle },
      { label: "Lançamentos", value: properties.filter((property) => property.purpose === "launch").length, icon: Building2 },
      { label: "Imóveis em destaque", value: properties.filter((property) => property.is_featured).length, icon: Star },
      { label: "Corretores cadastrados", value: 0, icon: UserRound },
      { label: "Bairros cadastrados", value: neighborhoods.size, icon: MapPinned },
    ];
  }, [leads.length, properties]);

  if (loading) return <AdminDashboardSkeleton />;

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-black">Não foi possível carregar o dashboard.</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-brand-strong p-6 text-white shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Visão geral</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">Gestão imobiliária RC Vend</h2>
            <p className="mt-3 max-w-2xl text-white/70">Acompanhe imóveis, lançamentos, leads e operação comercial em um painel preparado para crescer.</p>
          </div>
          <Link href="/admin/imoveis/novo" className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-black text-brand-strong hover:bg-white">
            Novo imóvel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-3xl border border-line bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted">{stat.label}</p>
                  <p className="mt-2 text-3xl font-black text-brand-strong">{stat.value}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/8 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Últimos leads</h2>
            <Link href="/admin/leads" className="text-sm font-black text-brand">Ver todos</Link>
          </div>
          <div className="mt-5 divide-y divide-line">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-black">{lead.full_name}</p>
                  <p className="text-sm text-muted">{lead.property_title ?? "Interesse geral"} • {formatDateTime(lead.created_at)}</p>
                </div>
                {lead.whatsapp || lead.phone ? (
                  <a className="rounded-xl bg-brand px-3 py-2 text-xs font-black text-white" href={`https://wa.me/55${(lead.whatsapp ?? lead.phone ?? "").replace(/\D/g, "")}`}>
                    WhatsApp
                  </a>
                ) : null}
              </div>
            ))}
            {leads.length === 0 && <p className="py-6 text-sm text-muted">Nenhum lead recebido ainda.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Últimos imóveis</h2>
            <Link href="/admin/imoveis" className="text-sm font-black text-brand">Gerenciar</Link>
          </div>
          <div className="mt-5 divide-y divide-line">
            {properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-black">{property.title}</p>
                  <p className="text-sm text-muted">
                    {purposeLabels[property.purpose]} • {statusLabels[property.status]} • {formatCurrency(property.price)}
                  </p>
                </div>
                <Link className="text-sm font-black text-brand" href={`/admin/imoveis/${property.id}/editar`}>
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-3xl border border-line bg-white" />
      ))}
    </div>
  );
}

