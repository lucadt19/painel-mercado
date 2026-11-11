/**
 * Canais do YouTube da página Notícias (abas "Morning calls" e "Podcasts &
 * vídeos"). Cada canal tem um feed público oficial:
 * https://www.youtube.com/feeds/videos.xml?channel_id=...
 *
 * Para achar o channel_id de um canal: abra youtube.com/@nome, e no código
 * da página procure "externalId". Edite à vontade.
 */

export type VideoKind = "morning" | "analise" | "educacao";

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  morning: "Morning call",
  analise: "Podcasts e análise",
  educacao: "Educação financeira",
};

export type VideoChannel = {
  id: string;
  name: string;
  channelId: string;
  kind: VideoKind;
  /** Só vídeos cujo título casa com isto (ex.: só o Morning Call do canal). */
  titleFilter?: RegExp;
};

export const videoChannels: VideoChannel[] = [
  // Morning calls: um vídeo por manhã, antes do pregão.
  { id: "btg", name: "BTG Pactual", channelId: "UCE5Uu3nZlVbTur6xwhdoKhg", kind: "morning", titleFilter: /morning call/i },
  { id: "genial", name: "Genial Investimentos", channelId: "UCYSOMA4Yx1CJvrdI8epLfnA", kind: "morning", titleFilter: /morning call/i },

  // Podcasts e análise.
  { id: "stockpickers", name: "Stock Pickers", channelId: "UCx7ki_a6KpcvwQLBTz-zquA", kind: "analise" },
  { id: "nord", name: "Nord Research", channelId: "UCsU0E4F3RxVOSjWlIMieReA", kind: "analise" },
  { id: "economistasincero", name: "Economista Sincero", channelId: "UCrp0zmecZ3TNV8FSR-tjv7A", kind: "analise" },
  { id: "sardinha", name: "Investidor Sardinha", channelId: "UCM3vJxmuJJkk1r0yzFI9eZg", kind: "analise" },

  // Educação financeira.
  { id: "mepoupe", name: "Me Poupe!", channelId: "UC8mDF5mWNGE-Kpfcvnn0bUg", kind: "educacao" },
  { id: "primopobre", name: "Primo Pobre", channelId: "UCOjXqrOxAdXa04obIQREfCA", kind: "educacao" },
];

/** Fora sempre: Shorts, lives e day trade. */
export const VIDEO_EXCLUDE = /#shorts|ao vivo|day trade|\blive\b/i;
