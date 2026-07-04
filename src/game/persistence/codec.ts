import type { Player } from "../types";
import { SAVE_CODE_PREFIX } from "../config/constants";
import { fromSaveShape, toSaveShape } from "./save";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Base64-Export/Import-Savecode (Abschnitt 20). UTF-8-sicher via TextEncoder
 * statt btoa direkt auf dem JSON-String, mit Präfix zur schnellen Validierung. */
export function exportSaveCode(player: Player): string {
  const json = JSON.stringify(toSaveShape(player));
  const bytes = new TextEncoder().encode(json);
  return SAVE_CODE_PREFIX + bytesToBase64(bytes);
}

export function importSaveCode(code: string): Player {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SAVE_CODE_PREFIX)) {
    throw new Error("Ungültiger Save-Code (falsches Format).");
  }
  const base64 = trimmed.slice(SAVE_CODE_PREFIX.length);
  let json: string;
  try {
    json = new TextDecoder().decode(base64ToBytes(base64));
  } catch {
    throw new Error("Ungültiger Save-Code (kein gültiges Base64).");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("Ungültiger Save-Code (beschädigte Daten).");
  }
  return fromSaveShape(raw);
}
