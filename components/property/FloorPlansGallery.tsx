"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import type { PropertyFloorPlan } from "@/types/property";

type FloorPlansGalleryProps = {
  plans: PropertyFloorPlan[];
};

function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf");
}

export function FloorPlansGallery({ plans }: FloorPlansGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPlan = selectedIndex === null ? null : plans[selectedIndex];
  const selectedTitle = selectedPlan ? selectedPlan.title ?? `Planta ${(selectedIndex ?? 0) + 1}` : "";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedIndex(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedPlan ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPlan]);

  return (
    <>
      <section className="mt-6 rounded-3xl border border-line bg-white p-7">
        <h2 className="text-2xl font-black">Plantas</h2>
        <p className="mt-2 text-sm text-muted">Veja as plantas disponíveis separadas da galeria de fotos.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {plans.map((plan, index) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="group overflow-hidden rounded-3xl border border-line bg-background text-left transition hover:border-brand/30 hover:shadow-lg"
            >
              {isPdf(plan.url) ? (
                <div className="grid min-h-56 place-items-center p-6 text-center">
                  <FileText className="h-10 w-10 text-brand" />
                  <p className="mt-3 font-black">{plan.title ?? `Planta ${index + 1}`}</p>
                  <p className="mt-1 text-sm text-muted">Visualizar planta</p>
                </div>
              ) : (
                <div className="relative aspect-[4/3] bg-line">
                  <Image
                    src={plan.url}
                    alt={plan.title ?? `Planta ${index + 1}`}
                    fill
                    sizes="(min-width: 768px) 42vw, 100vw"
                    className="object-contain p-3 transition group-hover:scale-[1.02]"
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {selectedPlan && (
        <div className="fixed inset-0 z-[80] bg-black/75 p-4 backdrop-blur-sm md:p-8" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" aria-label="Fechar planta" onClick={() => setSelectedIndex(null)} />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Planta do imóvel</p>
                <h3 className="truncate text-lg font-black">{selectedTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-brand transition hover:border-brand hover:bg-background"
                aria-label="Fechar e voltar para o site"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-background">
              {isPdf(selectedPlan.url) ? (
                <iframe title={selectedTitle || "Planta do imóvel"} src={selectedPlan.url} className="h-full w-full" />
              ) : (
                <Image
                  src={selectedPlan.url}
                  alt={selectedTitle || "Planta do imóvel"}
                  fill
                  sizes="100vw"
                  className="object-contain p-4 md:p-8"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
