import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcvend.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RC Vend | Imóveis, lançamentos e bairros em São Paulo",
    template: "%s | RC Vend",
  },
  description:
    "RC Vend é um portal imobiliário para buscar, comparar e encontrar imóveis, lançamentos e oportunidades por bairro em São Paulo.",
  keywords: ["imóveis", "lançamentos", "São Paulo", "Brooklin", "Moema", "portal imobiliário", "RC Vend"],
  openGraph: {
    title: "RC Vend",
    description: "Portal imobiliário para compra, locação, lançamentos e busca por bairros em São Paulo.",
    url: siteUrl,
    siteName: "RC Vend",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RC Vend",
    description: "Portal imobiliário para buscar, comparar e encontrar oportunidades em São Paulo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "RC Vend",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/imoveis?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "RC Vend",
                url: siteUrl,
              },
            }),
          }}
        />
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
