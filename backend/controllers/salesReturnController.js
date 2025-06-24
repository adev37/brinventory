// === File: backend/controllers/salesReturnController.js ===
import SalesReturn from "../models/SalesReturn.js";
import SalesInvoice from "../models/SalesInvoice.js";
import StockLedger from "../models/StockLedger.js";
import { increaseStock } from "../controllers/stockController.js";
import Warehouse from "../models/Warehouse.js";

export const createSalesReturn = async (req, res) => {
  try {
    const { referenceId, items, reason, warehouseId } = req.body;

    // ✅ Validate warehouse
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    // ✅ Fetch the invoice
    const invoice = await SalesInvoice.findById(referenceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // ✅ Check existing returns
    const pastReturns = await SalesReturn.find({ referenceId });

    const returnedQtyMap = {};
    for (const r of pastReturns) {
      for (const i of r.items) {
        returnedQtyMap[i.item] = (returnedQtyMap[i.item] || 0) + i.quantity;
      }
    }

    // ✅ Validate return quantities
    for (const { item, quantity } of items) {
      const original = invoice.items.find((i) => i.item.toString() === item);
      if (!original) {
        return res.status(400).json({
          message: `Item ${item} not found in invoice`,
        });
      }

      const alreadyReturned = returnedQtyMap[item] || 0;
      const remaining = original.quantity - alreadyReturned;

      if (quantity > remaining) {
        return res.status(400).json({
          message: `Cannot return ${quantity} of item ${item}. Only ${remaining} left to return.`,
        });
      }
    }

    // ✅ Create sales return + update stock and ledger
    const salesReturn = await SalesReturn.create({
      referenceId,
      items,
      reason,
      warehouse: warehouseId,
      createdBy: req.user._id,
    });

    for (const { item, quantity } of items) {
      await increaseStock(
        item,
        quantity,
        "SalesReturn",
        salesReturn._id,
        warehouseId
      );

      await StockLedger.create({
        item,
        transactionType: "RETURN",
        quantity,
        source: "SalesReturn",
        sourceId: salesReturn._id,
        warehouse: warehouseId,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "✅ Sales Return recorded and stock updated",
      salesReturn,
    });
  } catch (err) {
    console.error("❌ Error in createSalesReturn:", err);
    res.status(500).json({
      message: "Failed to create Sales Return",
      error: err.message,
    });
  }
};
// controllers/salesReturnController.js
export const getSalesReturns = async (req, res) => {
  try {
    const returns = await SalesReturn.find()
      .populate({
        path: "referenceId",
        select: "invoiceNumber client",
        populate: {
          path: "client",
          model: "Client", // ✅ explicitly tell Mongoose it's the Client model
          select: "name",
        },
      })
      .populate("items.item", "name")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (err) {
    console.error("❌ Error in getSalesReturns:", err);
    res.status(500).json({
      message: "Failed to fetch Sales Returns",
      error: err.message,
    });
  }
};
export const getEligibleInvoicesForReturn = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find()
      .populate("items.item", "name")
      .populate("client", "name");

    const returns = await SalesReturn.find();

    // Map: invoiceId -> itemId -> returnedQty
    const returnMap = {};
    for (const r of returns) {
      if (!returnMap[r.referenceId]) returnMap[r.referenceId] = {};
      for (const i of r.items) {
        returnMap[r.referenceId][i.item] =
          (returnMap[r.referenceId][i.item] || 0) + i.quantity;
      }
    }

    const eligible = invoices.filter((inv) =>
      inv.items.some((it) => {
        const returned = returnMap[inv._id]?.[it.item._id?.toString()] || 0;
        return returned < it.quantity;
      })
    );

    res.json(eligible);
  } catch (err) {
    console.error("❌ Error in getEligibleInvoicesForReturn:", err);
    res.status(500).json({
      message: "Failed to fetch eligible invoices",
      error: err.message,
    });
  }
};
