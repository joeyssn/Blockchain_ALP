import { sampleProducts } from "../mock/mockData.js";

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const mockStorageKey = "product-authenticity.mockProducts";

export { apiBaseUrl };

function readMockProducts() {
  if (typeof localStorage === "undefined") {
    return sampleProducts;
  }

  const stored = localStorage.getItem(mockStorageKey);

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem(mockStorageKey, JSON.stringify(sampleProducts));
  return sampleProducts;
}

function writeMockProducts(products) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(mockStorageKey, JSON.stringify(products));
  }
}

function sortNewest(products) {
  return [...products].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function withTimestamps(payload, existing = {}) {
  const now = new Date().toISOString();

  return {
    ...existing,
    ...payload,
    createdAt: existing.createdAt || now,
    updatedAt: now,
  };
}

function mockListMetadata() {
  return sortNewest(readMockProducts());
}

function mockGetMetadata(productCode) {
  const product = readMockProducts().find(
    (item) => item.productCode.toLowerCase() === productCode.toLowerCase()
  );

  if (!product) {
    throw new Error("Product metadata not found in mock data");
  }

  return product;
}

function mockCreateMetadata(payload) {
  const products = readMockProducts();

  if (products.some((product) => product.productCode === payload.productCode)) {
    throw new Error("Product code already exists in mock data");
  }

  const product = withTimestamps({
    status: "Feature Under Development",
    ...payload,
  });
  writeMockProducts([product, ...products]);
  return product;
}

function mockUpdateMetadata(productCode, payload) {
  const products = readMockProducts();
  const index = products.findIndex((product) => product.productCode === productCode);

  if (index === -1) {
    throw new Error("Product metadata not found in mock data");
  }

  const updated = withTimestamps(payload, products[index]);
  products[index] = updated;
  writeMockProducts(products);
  return updated;
}

function mockDeleteMetadata(productCode) {
  const products = readMockProducts();
  const nextProducts = products.filter((product) => product.productCode !== productCode);

  if (nextProducts.length === products.length) {
    throw new Error("Product metadata not found in mock data");
  }

  writeMockProducts(nextProducts);
  return null;
}

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

async function withMockFallback(apiCall, mockCall) {
  try {
    return {
      data: await apiCall(),
      source: "backend",
    };
  } catch (error) {
    return {
      data: mockCall(),
      source: "mock",
      reason: error.message,
    };
  }
}

export async function listMetadata() {
  return withMockFallback(() => request("/api/products"), mockListMetadata);
}

export async function checkBackendHealth() {
  return request("/health");
}

export async function getMetadata(productCode) {
  return withMockFallback(
    () => request(`/api/products/${encodeURIComponent(productCode)}`),
    () => mockGetMetadata(productCode)
  );
}

export async function createMetadata(payload) {
  return withMockFallback(
    () =>
      request("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    () => mockCreateMetadata(payload)
  );
}

export async function updateMetadata(productCode, payload) {
  return withMockFallback(
    () =>
      request(`/api/products/${encodeURIComponent(productCode)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    () => mockUpdateMetadata(productCode, payload)
  );
}

export async function deleteMetadata(productCode) {
  return withMockFallback(
    () =>
      request(`/api/products/${encodeURIComponent(productCode)}`, {
        method: "DELETE",
      }),
    () => mockDeleteMetadata(productCode)
  );
}
