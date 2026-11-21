export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export type AcceptedType = (typeof ACCEPTED_TYPES)[number];
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Shrinks large photos so uploads stay fast on slow mobile networks. */
async function downscaleImage(file: File): Promise<{ base64: string; mimeType: AcceptedType }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const max = 2000;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    return { base64: dataUrl.split(",")[1] ?? "", mimeType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareFile(file: File): Promise<{ base64: string; mimeType: AcceptedType; fileName: string }> {
  if (file.type === "application/pdf") {
    const dataUrl = await readAsDataURL(file);
    return { base64: dataUrl.split(",")[1] ?? "", mimeType: "application/pdf", fileName: file.name || "report.pdf" };
  }
  try {
    const img = await downscaleImage(file);
    return { ...img, fileName: file.name || "report.jpg" };
  } catch {
    const dataUrl = await readAsDataURL(file);
    return { base64: dataUrl.split(",")[1] ?? "", mimeType: file.type as AcceptedType, fileName: file.name || "report" };
  }
}
