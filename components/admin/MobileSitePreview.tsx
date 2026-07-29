"use client";

import { ExternalLink, RefreshCw, Smartphone } from "lucide-react";
import { useState } from "react";

const pageOptions = [
  { label: "Página inicial", path: "/" },
  { label: "Lista de imóveis", path: "/imoveis" },
  { label: "Lançamentos", path: "/lancamentos" },
  { label: "Mapa", path: "/mapa" },
  { label: "Anuncie", path: "/anuncie" },
  { label: "Contato", path: "/contato" },
];

const devices = [
  { label: "Compacto", width: 320, height: 568 },
  { label: "Android", width: 360, height: 740 },
  { label: "iPhone", width: 390, height: 844 },
  { label: "Grande", width: 430, height: 932 },
];

function normalizePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "/";
  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function MobileSitePreview() {
  const [path, setPath] = useState("/");
  const [customPath, setCustomPath] = useState("");
  const [deviceIndex, setDeviceIndex] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const device = devices[deviceIndex];

  function openCustomPath() {
    const nextPath = normalizePath(customPath);
    setPath(nextPath);
    setCustomPath(nextPath);
    setRefreshKey((current) => current + 1);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-brand-strong p-6 text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Conferência responsiva</p>
        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-black">Prévia do site no celular</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
              Confira páginas públicas em larguras reais de celular antes de publicar ou após uma alteração.
            </p>
          </div>
          <a
            href={path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-brand-strong transition hover:bg-white"
          >
            Abrir página real
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="self-start rounded-3xl border border-line bg-white p-5 shadow-sm xl:sticky xl:top-24">
          <h3 className="font-black">Página para conferir</h3>
          <div className="mt-4 grid gap-2">
            {pageOptions.map((page) => (
              <button
                key={page.path}
                type="button"
                onClick={() => {
                  setPath(page.path);
                  setCustomPath("");
                  setRefreshKey((current) => current + 1);
                }}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  path === page.path ? "bg-brand text-white" : "bg-background text-brand hover:bg-line"
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-black">Caminho personalizado</span>
            <span className="mt-1 block text-xs leading-5 text-muted">Ex.: /imoveis/nome-do-imovel</span>
            <input
              value={customPath}
              onChange={(event) => setCustomPath(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") openCustomPath();
              }}
              placeholder="/imoveis/..."
              className="mt-2 w-full min-w-0 rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="button"
            onClick={openCustomPath}
            className="mt-2 w-full rounded-2xl border border-brand px-4 py-3 text-sm font-black text-brand transition hover:bg-brand hover:text-white"
          >
            Carregar caminho
          </button>

          <h3 className="mt-6 font-black">Tamanho do aparelho</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {devices.map((item, index) => (
              <button
                key={item.width}
                type="button"
                onClick={() => setDeviceIndex(index)}
                className={`rounded-2xl px-3 py-3 text-xs font-black transition ${
                  deviceIndex === index ? "bg-accent text-brand-strong" : "bg-background text-muted hover:text-brand"
                }`}
              >
                {item.label}
                <span className="mt-1 block font-semibold">{item.width} px</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 overflow-hidden rounded-3xl border border-line bg-[#e5e9e4] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-black text-brand">
              <Smartphone className="h-4 w-4" />
              {device.width} × {device.height} px
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-black text-brand transition hover:border-brand"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar prévia
            </button>
          </div>

          <div className="overflow-x-auto p-4 sm:p-8">
            <div
              className="mx-auto overflow-hidden rounded-[2rem] border-[8px] border-[#101419] bg-white shadow-2xl"
              style={{ width: device.width + 16 }}
            >
              <div className="mx-auto h-5 w-28 rounded-b-2xl bg-[#101419]" />
              <iframe
                key={`${path}-${device.width}-${refreshKey}`}
                src={path}
                title={`Prévia mobile de ${path}`}
                sandbox="allow-same-origin"
                className="block w-full border-0 bg-white"
                style={{ height: device.height }}
              />
            </div>
          </div>
          <p className="border-t border-line bg-white px-5 py-4 text-xs leading-5 text-muted">
            Modo visual seguro: formulários e scripts ficam desativados nesta moldura. Use “Abrir página real” para testar interações.
          </p>
        </div>
      </div>
    </section>
  );
}
