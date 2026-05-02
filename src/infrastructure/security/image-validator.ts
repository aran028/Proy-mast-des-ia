export type ImageExt = 'png' | 'jpg' | 'webp' | 'gif'
export type ImageMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'

export interface DetectedImage {
  ext: ImageExt
  mime: ImageMime
}

// Detecta el tipo real de imagen leyendo los primeros bytes (firma binaria),
// ignorando lo que el cliente declara en file.type o file.name.
export function detectImage(buf: Buffer): DetectedImage | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' }
  }

  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' }
  }

  // GIF: 47 49 46 38 [37|39] 61  ("GIF87a" / "GIF89a")
  if (
    buf.length >= 6 &&
    buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61
  ) {
    return { ext: 'gif', mime: 'image/gif' }
  }

  // WEBP: "RIFF" .... "WEBP" (offsets 0-3 y 8-11)
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return { ext: 'webp', mime: 'image/webp' }
  }

  return null
}
