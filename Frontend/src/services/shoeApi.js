export const apiBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "API request failed");
  }

  return body.data;
}

export function getShoeMetadata(productCode) {
  return request(`/api/verify/${encodeURIComponent(productCode)}`);
}
