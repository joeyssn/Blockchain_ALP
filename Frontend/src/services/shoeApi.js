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

export function listCompanies() {
  return request("/api/companies");
}

export function saveCompany(payload) {
  return request("/api/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listShoes() {
  return request("/api/shoes");
}

export function listCompanyShoes(walletAddress) {
  return request(`/api/companies/${encodeURIComponent(walletAddress)}/shoes`);
}

export function getShoeMetadata(productCode) {
  return request(`/api/verify/${encodeURIComponent(productCode)}`);
}

export function saveShoe(payload) {
  return request("/api/shoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listActivityLogs() {
  return request("/api/activity-logs");
}

export function saveActivityLog(payload) {
  return request("/api/activity-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
