// backend/models/Item.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  unit: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // ✅ Required for category population
  },
  lowAlert: { type: Number, default: 5 },
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
