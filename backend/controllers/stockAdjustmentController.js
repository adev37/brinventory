import StockAdjustment from "../models/StockAdjustment.js";
import StockLedger from "../models/StockLedger.js";
import { increaseStock, decreaseStock } from "./stockController.js";

// ✅ Create Stock Adjustment
export const createAdjustment = async (req, res) => {
  try {
    const { item, adjustmentType, quantity, reason } = req.body;

    // 🔄 Update item stock
    if (adjustmentType === "increase") {
      await increaseStock(item, quantity);
    } else if (adjustmentType === "decrease") {
      await decreaseStock(item, quantity);
    } else {
      return res.status(400).json({ message: "Invalid adjustment type." });
    }

    // 📄 Create adjustment entry
    const adjustment = await StockAdjustment.create({
      item,
      adjustmentType,
      quantity,
      reason,
      adjustedBy: req.user?._id || null,
      adjustedAt: new Date(),
    });

    // 📘 Log to stock ledger
    await StockLedger.create({
      item,
      transactionType: "ADJUST",
      quantity,
      source: "StockAdjustment",
      sourceId: adjustment._id,
      timestamp: new Date(),
    });

    res.status(201).json({
      message: "✅ Stock adjustment successful.",
      adjustment,
    });
  } catch (error) {
    console.error("❌ Error in createAdjustment:", error);
    res.status(500).json({
      message: "Stock adjustment failed",
      error: error.message,
    });
  }
};

// ✅ Get All Adjustments
export const getAdjustments = async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find()
      .populate("item", "name sku")
      .populate("adjustedBy", "name")
      .sort({ adjustedAt: -1 });

    res.status(200).json(adjustments);
  } catch (error) {
    console.error("❌ Error in getAdjustments:", error);
    res.status(500).json({
      message: "Failed to fetch stock adjustments",
      error: error.message,
    });
  }
};
