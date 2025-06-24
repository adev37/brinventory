import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      quantity: Number,
      rate: Number,
      gst: Number,
      total: Number,
    },
  ],
  deliveryDate: Date,
  status: {
    type: String,
    enum: ["Pending", "Partially Received", "Received", "Cancelled"],
    default: "Pending",
  },
  remarks: String,

  // ✅ Only one correct definition of createdBy
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  source: {
    type: {
      type: String,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "source.type",
    },
  },

  // ✅ Warehouse reference
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
});

const PurchaseOrder = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
export default PurchaseOrder;
