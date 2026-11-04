import "server-only";
import { inflateRawSync } from "node:zlib";

/**
 * Lê um arquivo de dentro de um .zip (os dados abertos da CVM vêm assim),
 * sem dependência: percorre o diretório central do zip e descompacta com o
 * zlib que já vem no Node. Suporta os dois métodos comuns (guardado e deflate).
 */
export function readZipEntry(zip: Uint8Array, name: string): Uint8Array | null {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const decoder = new TextDecoder();

  // Fim do diretório central: assinatura 0x06054b50, nos últimos ~64 KB.
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;

  const entries = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);

  for (let n = 0; n < entries; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) return null;
    const method = view.getUint16(p + 10, true);
    const compSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const entryName = decoder.decode(zip.subarray(p + 46, p + 46 + nameLen));

    if (entryName === name) {
      // Cabeçalho local: os dados começam depois do nome e do "extra" dele.
      const lNameLen = view.getUint16(localOffset + 26, true);
      const lExtraLen = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + lNameLen + lExtraLen;
      const data = zip.subarray(start, start + compSize);
      if (method === 0) return data;
      if (method === 8) return new Uint8Array(inflateRawSync(data));
      return null;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}
