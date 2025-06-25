import SalesReturn from "../models/SalesReturn.js";
import SalesInvoice from "../models/SalesInvoice.js";
import { increaseStock } from "../utils/stockHelpers.js";
import Warehouse from "../models/Warehouse.js";

// @desc    Create Sales Return
// @route   POST /api/sales-returns
// @access  Private
export const createSalesReturn = async (req, res) => {
  try {
    const { referenceId, items, reason, warehouseId } = req.body;

    // 1. Validate warehouse
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    // 2. Fetch the invoice
    const invoice = await SalesInvoice.findById(referenceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 3. Aggregate already returned quantities
    const pastReturns = await SalesReturn.find({ referenceId });
    const returnedQtyMap = {};
    for (const r of pastReturns) {
      for (const i of r.items) {
        returnedQtyMap[i.item] = (returnedQtyMap[i.item] || 0) + i.quantity;
      }
    }

    // 4. Validate return quantities
    for (const { item, quantity } of items) {
      const original = invoice.items.find((i) => i.item.toString() === item);
      if (!original) {
        return res
          .status(400)
          .json({ message: `Item ${item} not found in invoice` });
      }

      const alreadyReturned = returnedQtyMap[item] || 0;
      const remaining = original.quantity - alreadyReturned;
      if (quantity > remaining) {
        return res.status(400).json({
          message: `Cannot return ${quantity} of item ${item}. Only ${remaining} left to return.`,
        });
      }
    }

    // 5. Create Sales Return FIRST to get _id for refNo
    const salesReturn = await SalesReturn.create({
      referenceId,
      items,
      reason,
      warehouse: warehouseId,
      createdBy: req.user._id,
    });

    const refNo = `SR#${salesReturn._id.toString().slice(-4)}`;

    // 6. Increase stock & auto-log to ledger using helper
    for (const { item, quantity } of items) {
      await increaseStock(
        item,
        quantity,
        "Sales Return",
        salesReturn._id,
        warehouseId,
        req.user?.name,
        reason,
        refNo
      );
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

// @desc    Get All Sales Returns (with client & item details)
// @route   GET /api/sales-returns
// @access  Private
export const getSalesReturns = async (req, res) => {
  try {
    const returns = await SalesReturn.find()
      .populate({
        path: "referenceId",
        select: "invoiceNumber client",
        populate: {
          path: "client",
          model: "Client",
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

// @desc    Get Eligible Invoices for Return (not fully returned)
// @route   GET /api/sales-returns/eligible
// @access  Private
export const getEligibleInvoicesForReturn = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find()
      .populate("items.item", "name")
      .populate("client", "name");

    const returns = await SalesReturn.find();

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
