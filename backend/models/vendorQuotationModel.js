import mongoose from "mongoose";

const vendorQuotationSchema = new mongoose.Schema(
  {
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
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // price per unit
      },
    ],
    validUntil: {
      type: Date,
      required: true,
    },
    terms: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Converted"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const VendorQuotation = mongoose.model(
  "VendorQuotation",
  vendorQuotationSchema
);
export default VendorQuotation;
