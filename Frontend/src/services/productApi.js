const apiBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "API request failed");
  }

  return body.data;
}

export function listMetadata() {
  return request("/api/products");
}

export function getMetadata(productCode) {
  return request(`/api/products/${encodeURIComponent(productCode)}`);
}

export function createMetadata(payload) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMetadata(productCode, payload) {
  return request(`/api/products/${encodeURIComponent(productCode)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMetadata(productCode) {
  return request(`/api/products/${encodeURIComponent(productCode)}`, {
    method: "DELETE",
  });
}
