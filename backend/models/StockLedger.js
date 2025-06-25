// === File: models/StockLedger.js ===
import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
  operation: {
    type: String,
    enum: [
      "GRN",
      "Delivery Challan",
      "Sales Return",
      "Purchase Return",
      "Stock Adjustment",
      "Transfer IN",
      "Transfer OUT",
      "Manual",
    ],
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["IN", "OUT"], // ✅ Add this field to indicate flow direction
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  refNo: {
    type: String,
    default: function () {
      return `REF-${Date.now()}`;
    },
  },
  remarks: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const StockLedger = mongoose.model("StockLedger", stockLedgerSchema);
export default StockLedger;
