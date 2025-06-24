import Stock from "../models/Stock.js";
import Item from "../models/Item.js";

// 📥 Increase Stock
export const increaseStock = async (
  itemId,
  qty,
  source = "System",
  sourceId = null,
  warehouseId,
  updatedBy = "System",
  remarks = ""
) => {
  let stock = await Stock.findOne({ item: itemId, warehouse: warehouseId });

  if (!stock) {
    stock = new Stock({
      item: itemId,
      quantity: qty,
      warehouse: warehouseId,
      lastUpdatedBy: updatedBy,
      remarks,
    });
  } else {
    stock.quantity += qty;
    stock.lastUpdatedBy = updatedBy;
    stock.remarks = remarks;
  }

  await stock.save();
};

// 📤 Decrease Stock (with validation and friendly error)
export const decreaseStock = async (
  itemId,
  qty,
  source = "System",
  sourceId = null,
  warehouseId
) => {
  const stock = await Stock.findOne({ item: itemId, warehouse: warehouseId });

  if (!stock) {
    const err = new Error("Stock not found for item in this warehouse.");
    err.code = "STOCK_NOT_FOUND";
    throw err;
  }

  if (stock.quantity < qty) {
    const err = new Error("Insufficient stock in this warehouse.");
    err.code = "INSUFFICIENT_STOCK";
    throw err;
  }

  stock.quantity -= qty;
  await stock.save();
};

// 📊 Get All Stocks with full item/category + optional warehouse filtering
// controllers/stockController.js
// backend/controllers/stockController.js

export const getAllStock = async (req, res) => {
  try {
    const stockList = await Stock.find().populate(
      "item",
      "name sku unit lowStockAlert"
    );

    const stockSummary = {};

    stockList.forEach((entry) => {
      const itemId = entry.item._id.toString();

      if (!stockSummary[itemId]) {
        stockSummary[itemId] = {
          _id: itemId,
          name: entry.item.name,
          sku: entry.item.sku,
          unit: entry.item.unit,
          lowAlert: entry.item.lowStockAlert || 0,
          quantity: 0,
        };
      }

      stockSummary[itemId].quantity += entry.quantity;
    });

    res.json(Object.values(stockSummary));
  } catch (err) {
    console.error("❌ Error fetching current stock:", err);
    res.status(500).json({ message: "Failed to fetch current stock" });
  }
};

// controllers/stockController.js
export const getStockByWarehouse = async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate("item", "name")
      .populate("warehouse", "name");

    const grouped = {};

    stock.forEach((entry) => {
      const item = entry.item?.name || "Unnamed";
      const warehouse = entry.warehouse?.name || "Unknown";

      if (!grouped[item]) grouped[item] = {};
      grouped[item][warehouse] =
        (grouped[item][warehouse] || 0) + entry.quantity;
    });

    res.json(grouped);
  } catch (err) {
    console.error("Error fetching stock by warehouse:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch stock", error: err.message });
  }
};
// ✅ POST /api/stocks/transfer
export const transferStock = async (req, res) => {
  try {
    const { itemId, fromWarehouseId, toWarehouseId, quantity } = req.body;
    const user = req.user?.name || "System";

    if (!itemId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res
        .status(400)
        .json({ message: "Source and destination warehouses must differ" });
    }

    // 1. Find source stock
    const sourceStock = await Stock.findOne({
      item: itemId,
      warehouse: fromWarehouseId,
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock in source warehouse" });
    }

    // 2. Find or create destination stock
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

    // 3. Update stock quantities
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
