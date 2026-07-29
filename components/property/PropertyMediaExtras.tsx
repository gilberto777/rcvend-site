import { ExternalLink, ScanLine, Video } from "lucide-react";

type PropertyMediaExtrasProps = {
  videoUrl?: string | null;
  tourUrl?: string | null;
  title: string;
};

export function PropertyMediaExtras({ videoUrl, tourUrl, title }: PropertyMediaExtrasProps) {
  if (!videoUrl && !tourUrl) return null;

  return (
    <section id="video-imovel" className="mt-6 scroll-mt-24 rounded-3xl border border-line bg-white p-7">
      <h2 className="text-2xl font-black">Mídia do imóvel</h2>
      <div className="mt-5 grid gap-5">
        {videoUrl ? (
          <div>
            <div className="mb-3 flex items-center gap-2 font-black text-brand">
              <Video className="h-5 w-5" />
              Vídeo
            </div>
            <video
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-3xl bg-black object-contain"
            >
              Seu navegador não suporta reprodução de vídeo.
            </video>
          </div>
        ) : null}

        {tourUrl ? (
          <a
            href={tourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-line px-5 py-3 font-black text-brand transition hover:border-brand hover:bg-background"
          >
            <ScanLine className="h-5 w-5" />
            Abrir tour virtual
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">de {title}</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
