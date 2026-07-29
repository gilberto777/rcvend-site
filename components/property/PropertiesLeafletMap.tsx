"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { formatDisplayText, formatPropertyPrice } from "@/lib/formatters";
import type { Property } from "@/types/property";

type PropertiesLeafletMapProps = {
  properties: Property[];
  heightClassName?: string;
};

const MAX_VIEWPORT_DISTANCE_DEGREES = 0.75;

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function getViewportProperties(properties: Property[]) {
  if (properties.length < 3) return properties;

  const medianLatitude = median(properties.map((property) => Number(property.latitude)));
  const medianLongitude = median(properties.map((property) => Number(property.longitude)));
  const clusteredProperties = properties.filter((property) => {
    return (
      Math.abs(Number(property.latitude) - medianLatitude) <= MAX_VIEWPORT_DISTANCE_DEGREES &&
      Math.abs(Number(property.longitude) - medianLongitude) <= MAX_VIEWPORT_DISTANCE_DEGREES
    );
  });

  return clusteredProperties.length >= 2 ? clusteredProperties : properties;
}

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 38px;
      height: 38px;
      border-radius: 9999px;
      background: #123f3b;
      border: 4px solid #fff;
      box-shadow: 0 14px 30px rgba(18, 63, 59, 0.35);
      display: grid;
      place-items: center;
    "><span style="width: 9px; height: 9px; border-radius: 9999px; background: #b8d872; display: block;"></span></div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

export function PropertiesLeafletMap({ properties, heightClassName = "min-h-[560px]" }: PropertiesLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const mappedProperties = useMemo(
    () =>
      properties.filter((property) => {
        return Number.isFinite(Number(property.latitude)) && Number.isFinite(Number(property.longitude));
      }),
    [properties],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    delete (container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;

    const map = L.map(container, {
      center: [-23.6, -46.68],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;

    const timer = window.setTimeout(() => map.invalidateSize(), 180);

    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      delete (container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = L.latLngBounds([]);
    const viewportProperties = getViewportProperties(mappedProperties);

    mappedProperties.forEach((property) => {
      const latLng = L.latLng(Number(property.latitude), Number(property.longitude));

      const popup = document.createElement("div");

      const title = document.createElement("p");
      title.style.fontWeight = "800";
      title.style.color = "#101419";
      title.style.margin = "0 0 4px";
      title.textContent = formatDisplayText(property.title);
      popup.appendChild(title);

      const location = document.createElement("p");
      location.style.fontSize = "12px";
      location.style.color = "#627084";
      location.style.margin = "0 0 6px";
      location.textContent = `${formatDisplayText(property.neighborhood)}, ${formatDisplayText(property.city)}`;
      popup.appendChild(location);

      const price = document.createElement("p");
      price.style.fontSize = "13px";
      price.style.fontWeight = "800";
      price.style.color = "#123f3b";
      price.style.margin = "0 0 8px";
      price.textContent = formatPropertyPrice(property);
      popup.appendChild(price);

      const link = document.createElement("a");
      link.href = `/imoveis/${property.slug}`;
      link.style.fontSize = "13px";
      link.style.fontWeight = "800";
      link.style.color = "#123f3b";
      link.style.textDecoration = "underline";
      link.textContent = "Ver detalhes";
      popup.appendChild(link);

      L.marker(latLng, { icon: markerIcon }).addTo(layer).bindPopup(popup);
    });

    viewportProperties.forEach((property) => {
      bounds.extend(L.latLng(Number(property.latitude), Number(property.longitude)));
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.18), {
        maxZoom: mappedProperties.length === 1 ? 15 : 13,
        animate: false,
      });
    }
  }, [mappedProperties]);

  return <div ref={containerRef} className={`h-full w-full ${heightClassName}`} />;
}
