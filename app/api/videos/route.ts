import { getVideos } from "@/lib/server/data";

/** Morning calls, podcasts e vídeos educacionais (feeds do YouTube). */
export async function GET() {
  return Response.json(await getVideos());
}
