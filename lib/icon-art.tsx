/**
 * Desenho do ícone do site (o mesmo de app/icon.svg) para gerar PNGs com
 * ImageResponse: ícone do iPhone e do Android ("Adicionar à tela de início").
 * Cores fixas porque o ícone fica fora da página (não segue o tema).
 */
export function IconArt({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#12151a",
      }}
    >
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 32 32">
        <polyline
          points="6,21 12,15 17,18 26,9"
          fill="none"
          stroke="#8b93f5"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
