// File: backend/models/Item.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    unit: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    description: { type: String, default: "" },
    pricePerUnit: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
