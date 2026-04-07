export function getOptimizedMediaUrl(url?: string | null): string {
  const raw = String(url || "").trim();
  if (!raw) return "";

  const uploadMarker = "/image/upload/";
  if (!raw.includes("res.cloudinary.com") || !raw.includes(uploadMarker)) return raw;

  const [prefix, rest] = raw.split(uploadMarker);
  if (!prefix || !rest) return raw;

  const firstSegment = rest.split("/")[0] || "";
  if (firstSegment.includes("f_auto") || firstSegment.includes("q_auto")) return raw;

  return `${prefix}${uploadMarker}f_auto,q_auto/${rest}`;
}
