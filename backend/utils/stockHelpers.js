// === File: utils/stockHelpers.js ===
import Stock from "../models/Stock.js";
import StockLedger from "../models/StockLedger.js";
import mongoose from "mongoose";

// 📥 INCREASE STOCK
export const increaseStock = async (
  itemId,
  quantity,
  operation = "System",
  referenceId = null,
  warehouseId = null,
  createdBy = null,
  remarks = "",
  refNo = "-"
) => {
  if (!itemId || !quantity || !warehouseId) {
    throw new Error("Missing required fields for stock increase");
  }

  const query = { item: itemId, warehouse: warehouseId };

  let stock = await Stock.findOne(query);

  if (!stock) {
    stock = new Stock({
      item: itemId,
      quantity,
      warehouse: warehouseId,
    });
  } else {
    stock.quantity += quantity;
  }

  await stock.save();

  const ledgerEntry = {
    item: itemId,
    warehouse: warehouseId,
    operation,
    transactionType: "IN",
    quantity,
    referenceId,
    refNo,
    remarks,
    date: new Date(),
  };

  if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
    ledgerEntry.createdBy = createdBy;
  }

  await StockLedger.create(ledgerEntry);
};

// 📤 DECREASE STOCK
export const decreaseStock = async (
  itemId,
  quantity,
  operation = "System",
  referenceId = null,
  warehouseId = null,
  createdBy = null,
  remarks = "",
  refNo = "-"
) => {
  if (!itemId || !quantity || !warehouseId) {
    throw new Error("Missing required fields for stock decrease");
  }

  const query = { item: itemId, warehouse: warehouseId };

  const stock = await Stock.findOne(query);

  if (!stock || stock.quantity < quantity) {
    const error = new Error("Insufficient stock in selected warehouse");
    error.code = "INSUFFICIENT_STOCK";
    throw error;
  }

  stock.quantity -= quantity;
  await stock.save();

  const ledgerEntry = {
    item: itemId,
    warehouse: warehouseId,
    operation,
    transactionType: "OUT",
    quantity,
    referenceId,
    refNo,
    remarks,
    date: new Date(),
  };

  if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
    ledgerEntry.createdBy = createdBy;
  }

  await StockLedger.create(ledgerEntry);
};
