import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    walletAddress: { type: String, trim: true, default: "" },
    contact: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const productMetadataSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    blockchainProductId: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    seller: {
      type: sellerSchema,
      default: () => ({}),
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const ProductMetadata = mongoose.model(
  "ProductMetadata",
  productMetadataSchema
);
