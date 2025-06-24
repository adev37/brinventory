import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["IN", "OUT", "ADJUST", "RETURN"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  source: {
    type: String, // e.g., 'GoodsReceipt', 'DeliveryChallan', etc.
    required: true,
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const StockLedger = mongoose.model("StockLedger", stockLedgerSchema);

export default StockLedger;
