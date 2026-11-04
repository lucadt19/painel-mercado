import { ImageResponse } from "next/og";
import { IconArt } from "@/lib/icon-art";

/** Ícone do iPhone ao "Adicionar à Tela de Início". */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<IconArt size={180} />, size);
}
