import {
  createProductMetadata,
  getProductMetadataByCode,
  listProductMetadata,
  removeProductMetadata,
  updateProductMetadata,
} from "../services/productMetadataService.js";

export async function listProducts(req, res, next) {
  try {
    const products = await listProductMetadata();
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await getProductMetadataByCode(req.params.productCode);

    if (!product) {
      return res.status(404).json({ message: "Product metadata not found" });
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await createProductMetadata(req.body);
    res.status(201).json({ data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product code already exists" });
    }

    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await updateProductMetadata(req.params.productCode, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product metadata not found" });
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function removeProduct(req, res, next) {
  try {
    const product = await removeProductMetadata(req.params.productCode);

    if (!product) {
      return res.status(404).json({ message: "Product metadata not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
