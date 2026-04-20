/**
 * API base URL. In dev, leave unset to use Vite proxy (same origin).
 * For preview/production against a separate API host, set VITE_API_URL.
 *
 * Must be the **public** https URL from Railway → Networking (e.g. https://….up.railway.app).
 * Never use *.railway.internal — that hostname only works inside Railway’s network; without
 * an https:// prefix the browser treats the value as a path on your site (broken URLs).
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== "string" || !raw.trim()) {
    return "";
  }
  let base = raw.trim().replace(/\/$/, "");
  if (base.includes(".railway.internal")) {
    console.error(
      "[PlayIQ] VITE_API_URL must be your API’s public https URL from Railway → Networking, " +
        "not *.railway.internal (internal hostnames do not work in the browser).",
    );
    return "";
  }
  if (!/^https?:\/\//i.test(base)) {
    const lower = base.toLowerCase();
    if (lower.startsWith("localhost") || lower.startsWith("127.0.0.1")) {
      base = `http://${base}`;
    } else {
      base = `https://${base}`;
    }
  }
  return base;
}

export function apiUrl(path) {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
