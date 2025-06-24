import mongoose from "mongoose";

// Define item sub-schema
const itemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  rate: {
    type: Number,
    required: true,
    min: [0, "Rate must be a non-negative number"],
  },
  gst: {
    type: Number,
    required: true,
    min: [0, "GST must be a non-negative number"],
  },
  delivered: {
    type: Number,
    default: 0,
    min: [0, "Delivered quantity cannot be negative"],
    validate: {
      validator: function (val) {
        return val <= this.quantity;
      },
      message: "Delivered quantity cannot exceed ordered quantity",
    },
  },
});

// Define Sales Order schema
const salesOrderSchema = new mongoose.Schema(
  {
    soNumber: {
      type: String,
      required: true,
      unique: true, // Make sure it's indexed uniquely
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Sales Order must have at least one item",
      },
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    remarks: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be a non-negative number"],
    },
    status: {
      type: String,
      enum: ["Pending", "Partially Delivered", "Completed"], // ✅ Removed "Confirmed"
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
salesOrderSchema.index({ status: 1 });
salesOrderSchema.index({ client: 1 });

// Optional: Pre-save hook to auto-calculate totalAmount (if not calculated on frontend)
/*
salesOrderSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.totalAmount = this.items.reduce((sum, i) => {
      const itemTotal = i.quantity * i.rate;
      const gstAmount = itemTotal * (i.gst / 100);
      return sum + itemTotal + gstAmount;
    }, 0);
  }
  next();
});
*/

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
export default SalesOrder;
