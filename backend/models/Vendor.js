import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    gstin: {
      type: String, // ✅ Add this field
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
