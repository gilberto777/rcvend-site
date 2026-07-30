"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { PromotionalBanner } from "@/types/banner";

type PromotionalBannerCarouselProps = {
  banners: PromotionalBanner[];
};

export function PromotionalBannerCarousel({ banners }: PromotionalBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentBanner = banners[currentIndex];

  useEffect(() => {
    if (banners.length < 2 || isPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % banners.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [banners.length, isPaused]);

  if (!currentBanner) return null;

  function showPrevious() {
    setCurrentIndex((index) => (index - 1 + banners.length) % banners.length);
  }

  function showNext() {
    setCurrentIndex((index) => (index + 1) % banners.length);
  }

  return (
    <section
      className="container-page max-w-[1280px] py-8 sm:py-10"
      aria-label="Promoções em destaque"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-brand/15 bg-[#03162d] shadow-[0_22px_65px_rgba(3,22,45,0.18)] sm:rounded-3xl">
        <Link href={currentBanner.link_url} className="group block" aria-label={`${currentBanner.title}. Saiba mais.`}>
          {currentBanner.mobile_image_url ? (
            <>
              <div className="relative aspect-[4/5] w-full md:hidden">
                <Image
                  key={currentBanner.mobile_image_url}
                  src={currentBanner.mobile_image_url}
                  alt={currentBanner.alt_text}
                  fill
                  sizes="100vw"
                  className="object-contain transition duration-500 group-hover:scale-[1.01]"
                />
              </div>
              <div className="relative hidden aspect-[1704/923] w-full md:block">
                <Image
                  key={currentBanner.image_url}
                  src={currentBanner.image_url}
                  alt={currentBanner.alt_text}
                  fill
                  sizes="1280px"
                  className="object-contain transition duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </>
          ) : (
            <div className="relative aspect-[1704/923] w-full">
              <Image
                key={currentBanner.image_url}
                src={currentBanner.image_url}
                alt={currentBanner.alt_text}
                fill
                sizes="(max-width: 768px) 100vw, 1280px"
                className="object-contain transition duration-500 group-hover:scale-[1.01]"
              />
            </div>
          )}
        </Link>

        {banners.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Banner anterior"
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-brand-strong/80 text-white shadow-lg backdrop-blur transition hover:bg-brand-strong sm:left-5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Próximo banner"
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-brand-strong/80 text-white shadow-lg backdrop-blur transition hover:bg-brand-strong sm:right-5"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-brand-strong/72 px-3 py-2 backdrop-blur sm:bottom-5">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Exibir banner ${index + 1}: ${banner.title}`}
                  aria-current={index === currentIndex}
                  className={`h-2.5 rounded-full transition ${index === currentIndex ? "w-7 bg-accent" : "w-2.5 bg-white/75 hover:bg-white"}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
