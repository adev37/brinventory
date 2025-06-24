// backend/models/StockAdjustment.js

import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    adjustmentType: {
      type: String,
      enum: ["increase", "decrease"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adjustedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const StockAdjustment = mongoose.model(
  "StockAdjustment",
  stockAdjustmentSchema
);

export default StockAdjustment;
