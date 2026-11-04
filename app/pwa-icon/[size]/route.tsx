import { ImageResponse } from "next/og";
import { IconArt } from "@/lib/icon-art";

/** Ícones PNG do manifesto (Android pede 192 e 512 px). Gerados no build. */
const SIZES = [192, 512];

export function generateStaticParams() {
  return SIZES.map((s) => ({ size: String(s) }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.includes(size)) return new Response("Tamanho não disponível", { status: 404 });
  return new ImageResponse(<IconArt size={size} />, { width: size, height: size });
}
