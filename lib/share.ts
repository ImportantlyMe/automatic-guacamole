// Share helper: tries Web Share API with files (iOS share sheet),
// falls back to a download link.

export async function shareOrDownload(
  filename: string,
  mime: string,
  data: Uint8Array | string
): Promise<void> {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const file = new File([blob], filename, { type: mime });

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string }) => Promise<void>;
  };

  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: filename });
      return;
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === "AbortError") return;
      // fall through to download fallback
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
