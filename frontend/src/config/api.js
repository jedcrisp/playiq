/**
 * API base URL. In dev, leave unset to use Vite proxy (same origin).
 * For preview/production against a separate API host, set VITE_API_URL.
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/$/, "");
  }
  return "";
}

export function apiUrl(path) {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
