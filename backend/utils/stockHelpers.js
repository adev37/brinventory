import Stock from "../models/Stock.js";
import StockLedger from "../models/StockLedger.js";

// 📥 INCREASE STOCK (with warehouse-aware logic)
export const increaseStock = async (
  itemId,
  quantity,
  source = "System",
  sourceId = null,
  warehouseId = null
) => {
  const query = { item: itemId };
  if (warehouseId) query.warehouse = warehouseId;

  let stock = await Stock.findOne(query);

  if (!stock) {
    stock = new Stock({
      item: itemId,
      quantity,
      ...(warehouseId && { warehouse: warehouseId }),
    });
  } else {
    stock.quantity += quantity;
  }

  await stock.save();

  await StockLedger.create({
    item: itemId,
    transactionType: "IN",
    quantity,
    source,
    sourceId,
    ...(warehouseId && { warehouse: warehouseId }),
    timestamp: new Date(),
  });
};

// 📤 DECREASE STOCK (with warehouse-aware logic)
export const decreaseStock = async (
  itemId,
  quantity,
  source = "System",
  sourceId = null,
  warehouseId = null
) => {
  const query = { item: itemId };
  if (warehouseId) query.warehouse = warehouseId;

  const stock = await Stock.findOne(query);

  if (!stock || stock.quantity < quantity) {
    const error = new Error(
      "Insufficient stock" + (warehouseId ? " in selected warehouse" : "")
    );
    error.code = "INSUFFICIENT_STOCK";
    throw error;
  }

  stock.quantity -= quantity;
  await stock.save();

  await StockLedger.create({
    item: itemId,
    transactionType: "OUT",
    quantity,
    source,
    sourceId,
    ...(warehouseId && { warehouse: warehouseId }),
    timestamp: new Date(),
  });
};
