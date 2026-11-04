import type { MetadataRoute } from "next";
import { siteName } from "@/config/site";

/** Permite "Adicionar à tela de início" no celular: abre como app, sem barra do navegador. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: "Painel pessoal de mercado: bolsa, renda fixa e notícias.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d10",
    theme_color: "#0b0d10",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
