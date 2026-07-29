"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/types/property";

const PropertiesLeafletMap = dynamic(() => import("./PropertiesLeafletMap").then((mod) => mod.PropertiesLeafletMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[560px] w-full place-items-center bg-background text-sm font-bold text-muted">
      Carregando mapa...
    </div>
  ),
});

export function PropertiesMapShell({ properties, heightClassName }: { properties: Property[]; heightClassName?: string }) {
  return <PropertiesLeafletMap properties={properties} heightClassName={heightClassName} />;
}
