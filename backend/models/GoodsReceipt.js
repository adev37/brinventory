import mongoose from "mongoose";

const goodsReceiptSchema = new mongoose.Schema(
  {
    // ✅ Reference to the Purchase Order
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },

    // ✅ List of received items with quantity
    receivedItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        receivedQty: {
          type: Number,
          required: true,
          min: [0, "Received quantity must be >= 0"],
        },
      },
    ],

    // ✅ Mandatory warehouse reference
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    // ✅ Optional remarks
    remarks: {
      type: String,
      default: "",
    },

    // ✅ Creator of the GRN
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt
  }
);

// ✅ Create and export the model
const GoodsReceipt = mongoose.model("GoodsReceipt", goodsReceiptSchema);
export default GoodsReceipt;
