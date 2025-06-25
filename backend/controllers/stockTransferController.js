import Stock from "../models/Stock.js";
import StockLedger from "../models/StockLedger.js";

// @desc    Transfer stock between warehouses
// @route   POST /api/stock/transfer
// @access  Private
export const transferStock = async (req, res) => {
  try {
    const { itemId, fromWarehouseId, toWarehouseId, quantity } = req.body;
    const user = req.user?.name || "System";
    const userId = req.user?._id || null;

    if (!itemId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res
        .status(400)
        .json({ message: "Source and destination warehouses must differ" });
    }

    // 🔍 1. Validate source stock
    const sourceStock = await Stock.findOne({
      item: itemId,
      warehouse: fromWarehouseId,
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock in source warehouse" });
    }

    // 📦 2. Find or create destination stock
    const targetStock =
      (await Stock.findOne({
        item: itemId,
        warehouse: toWarehouseId,
      })) ||
      new Stock({
        item: itemId,
        warehouse: toWarehouseId,
        quantity: 0,
      });

    // ✏️ 3. Update stock quantities
    sourceStock.quantity -= quantity;
    sourceStock.lastUpdated = new Date();
    sourceStock.lastUpdatedBy = user;
    sourceStock.remarks = `Transferred ${quantity} to warehouse ${toWarehouseId}`;

    targetStock.quantity += quantity;
    targetStock.lastUpdated = new Date();
    targetStock.lastUpdatedBy = user;
    targetStock.remarks = `Received ${quantity} from warehouse ${fromWarehouseId}`;

    await sourceStock.save();
    await targetStock.save();

    // 📘 4. Create StockLedger entries for both warehouses
    const refSuffix = `${Date.now()}`; // timestamp for uniqueness

    await StockLedger.create({
      item: itemId,
      warehouse: fromWarehouseId,
      transactionType: "OUT",
      operation: "Transfer OUT",
      quantity,
      source: "StockTransfer",
      sourceId: null,
      refNo: `TX#OUT-${refSuffix}`,
      remarks: `Transferred to warehouse ${toWarehouseId}`,
      createdBy: userId,
      date: new Date(),
    });

    await StockLedger.create({
      item: itemId,
      warehouse: toWarehouseId,
      transactionType: "IN",
      operation: "Transfer IN",
      quantity,
      source: "StockTransfer",
      sourceId: null,
      refNo: `TX#IN-${refSuffix}`,
      remarks: `Received from warehouse ${fromWarehouseId}`,
      createdBy: userId,
      date: new Date(),
    });

    res.status(200).json({
      message: "✅ Stock transferred successfully",
      source: sourceStock,
      destination: targetStock,
    });
  } catch (err) {
    console.error("❌ Error in transferStock:", err);
    res.status(500).json({
      message: "Failed to transfer stock",
      error: err.message,
    });
  }
};
