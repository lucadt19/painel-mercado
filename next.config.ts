import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
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
