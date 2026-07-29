"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { formatDateTime, getStatusTone, leadStatusLabels } from "@/lib/admin/labels";
import { listAdminLeads, type AdminLead } from "@/lib/admin/client-data";
import type { LeadStatus } from "@/types/property";

export function AdminLeadsManager() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");

  useEffect(() => {
    async function load() {
      try {
        setLeads(await listAdminLeads());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar leads.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !term ||
        [lead.full_name, lead.email ?? "", lead.phone ?? "", lead.whatsapp ?? "", lead.property_title ?? ""].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesStatus = status === "all" || lead.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [leads, q, status]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-brand-strong p-6 text-white shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Relacionamento comercial</p>
        <h2 className="mt-2 text-3xl font-black">Leads</h2>
        <p className="mt-2 max-w-2xl text-white/70">Acompanhe contatos recebidos pelo portal, origem, imóvel de interesse e próxima ação pelo WhatsApp.</p>
      </section>

      <section className="rounded-3xl border border-line bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3">
            <Search className="h-5 w-5 text-brand" />
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar por nome, telefone, e-mail ou imóvel" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus | "all")} className="rounded-2xl border border-line bg-background px-4 py-3 text-sm font-bold">
            <option value="all">Todos os status</option>
            {Object.entries(leadStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </section>

      {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Imovel de interesse</th>
                <th className="p-4">Origem</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data</th>
                <th className="p-4">Acao</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted">Carregando leads...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted">Nenhum lead encontrado.</td></tr>
              ) : (
                filtered.map((lead) => {
                  const phone = (lead.whatsapp ?? lead.phone ?? "").replace(/\D/g, "");
                  return (
                    <tr key={lead.id} className="border-t border-line">
                      <td className="p-4 font-black">{lead.full_name}</td>
                      <td className="p-4 text-muted">{lead.whatsapp ?? lead.phone ?? "-"}</td>
                      <td className="p-4 text-muted">{lead.email ?? "-"}</td>
                      <td className="p-4">
                        {lead.property_slug ? (
                          <Link href={`/imoveis/${lead.property_slug}`} className="font-bold text-brand">{lead.property_title}</Link>
                        ) : (
                          <span className="text-muted">{lead.property_title ?? "Interesse geral"}</span>
                        )}
                      </td>
                      <td className="p-4 text-muted">{lead.source}</td>
                      <td className="p-4"><AdminBadge tone={getStatusTone(lead.status)}>{leadStatusLabels[lead.status]}</AdminBadge></td>
                      <td className="p-4 text-muted">{formatDateTime(lead.created_at)}</td>
                      <td className="p-4">
                        {phone ? (
                          <a href={`https://wa.me/55${phone}`} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-black text-brand-strong">
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

