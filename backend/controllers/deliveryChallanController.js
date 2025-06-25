// === File: backend/controllers/deliveryChallanController.js ===

import DeliveryChallan from "../models/DeliveryChallan.js";
import SalesOrder from "../models/SalesOrder.js";
import { decreaseStock } from "../utils/stockHelpers.js";
import Warehouse from "../models/Warehouse.js";
import mongoose from "mongoose"; // ✅ Required to validate ObjectId

// @desc    Create Delivery Challan from a Sales Order
// @route   POST /api/delivery-challans
// @access  Private
export const createChallan = async (req, res) => {
  try {
    const { salesOrderId, items, transportDetails, warehouseId } = req.body;
    const createdBy = req.user?._id;

    // 1. Validate warehouse
    const warehouseExists = await Warehouse.findById(warehouseId);
    if (!warehouseExists) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    // 2. Fetch Sales Order
    const salesOrder = await SalesOrder.findById(salesOrderId);
    if (!salesOrder) {
      return res.status(404).json({ message: "Sales Order not found" });
    }

    // 3. Create Delivery Challan
    const challan = await DeliveryChallan.create({
      salesOrder: salesOrder._id,
      client: salesOrder.client,
      items,
      transportDetails,
      warehouse: warehouseId,
    });

    // 4. Decrease stock (which logs StockLedger too)
    for (const i of items) {
      await decreaseStock(
        i.item,
        i.quantity,
        "Delivery Challan",
        challan._id,
        warehouseId,
        createdBy,
        `Against SO#${
          salesOrder.soNumber || salesOrder._id.toString().slice(-4)
        }`,
        `DC#${challan._id.toString().slice(-4)}`
      );
    }

    // 5. Update delivered quantities in Sales Order
    let fullyDelivered = true;
    for (let dcItem of items) {
      const soItem = salesOrder.items.find(
        (i) => i.item.toString() === dcItem.item.toString()
      );
      if (soItem) {
        soItem.delivered = (soItem.delivered || 0) + dcItem.quantity;
        if (soItem.delivered < soItem.quantity) {
          fullyDelivered = false;
        }
      }
    }

    // 6. Update Sales Order status
    salesOrder.status = fullyDelivered ? "Completed" : "Partially Delivered";
    await salesOrder.save();

    res.status(201).json({
      message: "✅ Delivery Challan created, stock updated, SO updated.",
      challan,
    });
  } catch (err) {
    console.error("❌ Error in createChallan:", err);
    res.status(500).json({
      message: "Failed to create Delivery Challan",
      error: err.message,
    });
  }
};

// @desc    Get all Delivery Challans
// @route   GET /api/delivery-challans
// @access  Private
export const getChallans = async (req, res) => {
  try {
    const data = await DeliveryChallan.find()
      .populate("items.item", "name pricePerUnit")
      .populate("client", "name")
      .populate("salesOrder", "soNumber status");

    res.json(data);
  } catch (err) {
    console.error("❌ Error in getChallans:", err);
    res.status(500).json({
      message: "Failed to fetch Delivery Challans",
      error: err.message,
    });
  }
};
