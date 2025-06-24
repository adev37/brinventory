// models/PurchaseReturn.js
import mongoose from "mongoose";

const purchaseReturnSchema = new mongoose.Schema(
  {
    grn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodsReceipt",
      required: true,
    },
    returnedItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        returnQty: { type: Number, required: true, min: 1 },
        reason: { type: String },
      },
    ],
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    remarks: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const PurchaseReturn = mongoose.model("PurchaseReturn", purchaseReturnSchema);
export default PurchaseReturn;
