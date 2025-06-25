// === File: controllers/stockLedgerController.js ===

import StockLedger from "../models/StockLedger.js";

/**
 * @desc    Get stock ledger entries with optional filters
 * @route   GET /api/stock-ledger
 * @access  Private
 */
export const getStockLedger = async (req, res) => {
  try {
    const { warehouseId, itemId, operation, startDate, endDate, userId } =
      req.query;

    const filter = {};

    // 🔍 Apply filters based on query params
    if (warehouseId) filter.warehouse = warehouseId;
    if (itemId) filter.item = itemId;
    if (operation) filter.operation = operation;
    if (userId) filter.createdBy = userId;

    // 📅 Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 📦 Fetch filtered ledger with population
    const ledger = await StockLedger.find(filter)
      .populate("item", "name sku")
      .populate("warehouse", "name")
      .populate("createdBy", "name role")
      .sort({ date: -1 });

    res.status(200).json(ledger);
  } catch (error) {
    console.error("❌ Error in getStockLedger:", error);
    res.status(500).json({
      message: "Failed to fetch stock ledger",
      error: error.message,
    });
  }
};
