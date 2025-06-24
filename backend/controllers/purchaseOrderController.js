import VendorQuotation from "../models/vendorQuotationModel.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

import Item from "../models/Item.js"; // only if needed for unit etc.
import Warehouse from "../models/Warehouse.js"; // Add this import

// controllers/purchaseOrderController.js

export const createPurchaseOrder = async (req, res) => {
  try {
    const {
      poNumber,
      vendor,
      items,
      deliveryDate,
      remarks,
      createdBy,
      warehouse, // ✅ field name should match frontend
    } = req.body;

    // ✅ Validate warehouse
    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(400).json({ message: "Invalid warehouse selected" });
    }

    const totalItems = items.map((item) => ({
      ...item,
      total:
        item.quantity * item.rate +
        (item.quantity * item.rate * item.gst) / 100,
    }));

    const newPO = new PurchaseOrder({
      poNumber,
      vendor,
      items: totalItems,
      deliveryDate,
      remarks,
      createdBy,
      warehouse, // ✅ already validated above
      status: "Pending",
    });

    await newPO.save();

    res.status(201).json({ message: "Purchase Order created", po: newPO });
  } catch (error) {
    console.error("Error creating PO:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getAllPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate("vendor")
      .populate("items.item");
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPOFromQuotation = async (req, res) => {
  try {
    const { quotationId, deliveryDate, createdBy, warehouseId } = req.body;

    // ✅ Validate required fields
    if (!quotationId || !deliveryDate || !warehouseId || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate warehouse
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(400).json({ message: "Invalid warehouse selected" });
    }

    // ✅ Find and validate quotation
    const quotation = await VendorQuotation.findById(quotationId)
      .populate("vendor")
      .populate("items.item");

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // ✅ Check if already converted
    if (quotation.status === "Converted") {
      return res
        .status(400)
        .json({ message: "Quotation already converted to PO" });
    }

    // ✅ Generate PO items
    const poItems = quotation.items.map((qi) => {
      const { quantity, price } = qi;
      const gst = qi.item?.gst || 0;
      const unit = qi.item?.unit || "";
      const total = quantity * price + (quantity * price * gst) / 100;

      return {
        item: qi.item._id,
        quantity,
        rate: price,
        gst,
        unit,
        total,
      };
    });

    const poNumber = "PO-" + Date.now();

    // ✅ Create and save new PO
    const newPO = new PurchaseOrder({
      poNumber,
      vendor: quotation.vendor._id,
      items: poItems,
      deliveryDate,
      remarks: quotation.terms,
      createdBy,
      warehouse: warehouseId,
      status: "Pending",
    });

    await newPO.save();

    // ✅ Update quotation status
    quotation.status = "Converted";
    await quotation.save();

    res.status(201).json({
      message: "✅ Purchase Order created from quotation",
      po: newPO,
    });
  } catch (err) {
    console.error("❌ Error creating PO from quotation:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
