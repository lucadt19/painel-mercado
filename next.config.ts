import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Tempo máximo para montar uma resposta em cache (padrão: 54 s). Com a
  // watchlist cheia, a rodada de cotações espera vagas no limite de 20
  // chamadas/min da brapi e leva ~70 s.
  staticPageGenerationTimeout: 150,
  experimental: { useCacheTimeout: 130 },
  // Histórico da B3 (data/b3-historico): lido do disco por estas rotas no servidor.
  outputFileTracingIncludes: {
    "/api/quotes": ["./data/b3-historico/**/*"],
    "/api/asset/[ticker]": ["./data/b3-historico/**/*"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
