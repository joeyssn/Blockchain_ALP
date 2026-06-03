import mongoose from "mongoose";
import { ProductMetadata } from "../models/ProductMetadata.js";

const memoryProducts = [];

function databaseReady() {
  return mongoose.connection.readyState === 1;
}

function clone(value) {
  if (value === null || value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

export async function listProductMetadata() {
  if (!databaseReady()) {
    return clone(memoryProducts).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  return ProductMetadata.find().sort({ createdAt: -1 });
}

export async function getProductMetadataByCode(productCode) {
  if (!databaseReady()) {
    return clone(memoryProducts.find((product) => product.productCode === productCode));
  }

  return ProductMetadata.findOne({ productCode });
}

export async function createProductMetadata(payload) {
  if (!databaseReady()) {
    if (memoryProducts.some((product) => product.productCode === payload.productCode)) {
      const error = new Error("Product code already exists");
      error.code = 11000;
      throw error;
    }

    const now = new Date().toISOString();
    const product = {
      ...payload,
      _id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    memoryProducts.push(product);
    return clone(product);
  }

  return ProductMetadata.create(payload);
}

export async function updateProductMetadata(productCode, payload) {
  if (!databaseReady()) {
    const index = memoryProducts.findIndex(
      (product) => product.productCode === productCode
    );

    if (index === -1) {
      return null;
    }

    memoryProducts[index] = {
      ...memoryProducts[index],
      ...payload,
      productCode,
      updatedAt: new Date().toISOString(),
    };

    return clone(memoryProducts[index]);
  }

  return ProductMetadata.findOneAndUpdate(
    { productCode },
    { $set: payload },
    { new: true, runValidators: true }
  );
}

export async function removeProductMetadata(productCode) {
  if (!databaseReady()) {
    const index = memoryProducts.findIndex(
      (product) => product.productCode === productCode
    );

    if (index === -1) {
      return null;
    }

    const [product] = memoryProducts.splice(index, 1);
    return clone(product);
  }

  return ProductMetadata.findOneAndDelete({ productCode });
}
