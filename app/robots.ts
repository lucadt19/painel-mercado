import type { MetadataRoute } from "next";

/** Site pessoal: nenhum buscador deve indexar (as páginas também têm noindex). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
