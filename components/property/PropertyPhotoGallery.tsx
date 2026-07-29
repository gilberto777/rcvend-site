"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, ScanLine, Video, X } from "lucide-react";
import type { PropertyImage } from "@/types/property";

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

type PropertyPhotoGalleryProps = {
  coverImage: string;
  title: string;
  images: PropertyImage[];
  videoUrl?: string | null;
  tourUrl?: string | null;
};

export function PropertyPhotoGallery({ coverImage, title, images, videoUrl, tourUrl }: PropertyPhotoGalleryProps) {
  const galleryImages = useMemo(() => {
    const items: GalleryImage[] = [
      {
        id: "cover",
        url: coverImage,
        alt: title,
      },
      ...images.map((image, index) => ({
        id: image.id || `image-${index}`,
        url: image.url,
        alt: image.alt || `${title} - foto ${index + 1}`,
      })),
    ];

    return items.filter((item, index, list) => item.url && list.findIndex((candidate) => candidate.url === item.url) === index);
  }, [coverImage, images, title]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage = selectedIndex === null ? null : galleryImages[selectedIndex];

  function openGallery(index: number) {
    setSelectedIndex(index);
  }

  const closeGallery = useCallback(function closeGallery() {
    setSelectedIndex(null);
  }, []);

  const showPrevious = useCallback(function showPrevious() {
    setSelectedIndex((current) => {
      if (current === null) return current;
      return current === 0 ? galleryImages.length - 1 : current - 1;
    });
  }, [galleryImages.length]);

  const showNext = useCallback(function showNext() {
    setSelectedIndex((current) => {
      if (current === null) return current;
      return current === galleryImages.length - 1 ? 0 : current + 1;
    });
  }, [galleryImages.length]);

  useEffect(() => {
    if (!selectedImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeGallery, selectedImage, showNext, showPrevious]);

  if (!galleryImages.length) return null;

  return (
    <>
      <section className="container-page py-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-line">
            <button
              type="button"
              onClick={() => openGallery(0)}
              className="group absolute inset-0 text-left"
              aria-label="Abrir foto principal"
            >
              <Image
                src={galleryImages[0].url}
                alt={galleryImages[0].alt}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </button>
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <GalleryBadge count={galleryImages.length} />
              {videoUrl ? (
                <a
                  href="#video-imovel"
                  className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-black text-foreground shadow-lg transition hover:bg-white"
                >
                  <Video className="h-4 w-4" />
                  Video
                </a>
              ) : null}
              {tourUrl ? (
                <a
                  href={tourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-black text-foreground shadow-lg transition hover:bg-white"
                >
                  <ScanLine className="h-4 w-4" />
                  Tour virtual
                </a>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {galleryImages.slice(1, 5).map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => openGallery(index + 1)}
                className="group relative min-h-40 overflow-hidden rounded-3xl bg-line"
                aria-label={`Abrir foto ${index + 2}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 21vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-[90] bg-black" role="dialog" aria-modal="true" aria-label="Galeria de fotos">
          <div className="absolute left-4 top-4 z-10 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {selectedIndex! + 1} / {galleryImages.length}
          </div>
          <button
            type="button"
            onClick={closeGallery}
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Fechar galeria"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative h-full w-full px-4 py-16 md:px-20">
            <Image src={selectedImage.url} alt={selectedImage.alt} fill sizes="100vw" className="object-contain p-4 md:p-10" priority />
          </div>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-10 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-10 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Proxima foto"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function GalleryBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-black text-foreground shadow-lg">
      <Camera className="h-4 w-4" />
      {count} fotos
    </span>
  );
}
