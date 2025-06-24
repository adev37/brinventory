import StockLedger from "../models/StockLedger.js";

export const getStockLedger = async (req, res) => {
  try {
    const { warehouseId } = req.query;

    const filter = {};
    if (warehouseId) {
      filter.warehouse = warehouseId;
    }

    const ledger = await StockLedger.find(filter)
      .populate("item", "name sku")
      .populate("warehouse", "name") // Optional: populate warehouse name
      .sort({ timestamp: -1 });

    res.json(ledger);
  } catch (error) {
    console.error("❌ Error in getStockLedger:", error);
    res.status(500).json({ message: "Failed to fetch stock ledger" });
  }
};
