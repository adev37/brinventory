import mongoose from "mongoose";

const deliveryChallanSchema = new mongoose.Schema({
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesOrder",
    required: true,
  }, // ✅ Link to SO
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  }, // ✅ Replace string with ref
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: Number,
    },
  ],
  transportDetails: String,
  date: { type: Date, default: Date.now },
});

const DeliveryChallan = mongoose.model(
  "DeliveryChallan",
  deliveryChallanSchema
);
export default DeliveryChallan;
