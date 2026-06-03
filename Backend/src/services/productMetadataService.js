import { ProductMetadata } from "../models/ProductMetadata.js";

export function listProductMetadata() {
  return ProductMetadata.find().sort({ createdAt: -1 });
}

export function getProductMetadataByCode(productCode) {
  return ProductMetadata.findOne({ productCode });
}

export function createProductMetadata(payload) {
  return ProductMetadata.create(payload);
}

export function updateProductMetadata(productCode, payload) {
  return ProductMetadata.findOneAndUpdate(
    { productCode },
    { $set: payload },
    { new: true, runValidators: true }
  );
}

export function removeProductMetadata(productCode) {
  return ProductMetadata.findOneAndDelete({ productCode });
}
