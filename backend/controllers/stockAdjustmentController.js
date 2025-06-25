import StockAdjustment from "../models/StockAdjustment.js";
import { increaseStock, decreaseStock } from "../utils/stockHelpers.js";

// ✅ Create Stock Adjustment
export const createAdjustment = async (req, res) => {
  try {
    const { item, adjustmentType, quantity, reason, warehouse } = req.body;

    // 🔒 Validate required fields
    if (!item || !adjustmentType || !quantity || !reason || !warehouse) {
      return res
        .status(400)
        .json({ message: "All fields are required including warehouse." });
    }

    // 📝 Create the adjustment record
    const adjustment = await StockAdjustment.create({
      item,
      adjustmentType,
      quantity,
      reason,
      warehouse,
      adjustedBy: req.user?._id || null,
      adjustedAt: new Date(),
    });

    // 📄 Ledger reference and audit actor
    const refNo = `ADJ#${adjustment._id.toString().slice(-4)}`;
    const actor = req.user?.name || "System";
    const userId = req.user?._id || null;

    // 🔁 Perform stock mutation and log in ledger
    if (adjustmentType === "increase") {
      await increaseStock(
        item,
        quantity,
        "Stock Adjustment",
        adjustment._id,
        warehouse,
        userId,
        reason,
        refNo
      );
    } else if (adjustmentType === "decrease") {
      await decreaseStock(
        item,
        quantity,
        "Stock Adjustment",
        adjustment._id,
        warehouse,
        userId,
        reason,
        refNo
      );
    } else {
      return res.status(400).json({ message: "Invalid adjustment type" });
    }

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
