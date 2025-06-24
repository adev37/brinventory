// backend/controllers/purchaseReturnController.js
import PurchaseReturn from "../models/PurchaseReturn.js";
import GoodsReceipt from "../models/GoodsReceipt.js";
import { decreaseStock } from "./stockController.js";
import Warehouse from "../models/Warehouse.js";

import StockLedger from "../models/StockLedger.js"; // ✅ Add this import if missing

export const createPurchaseReturn = async (req, res) => {
  try {
    const { grn, returnedItems, remarks, createdBy, warehouse } = req.body;

    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    const grnDoc = await GoodsReceipt.findById(grn).populate(
      "receivedItems.item"
    );
    if (!grnDoc) {
      return res.status(404).json({ message: "GRN not found" });
    }

    const grnItemsMap = {};
    for (const ri of grnDoc.receivedItems) {
      grnItemsMap[ri.item._id.toString()] = ri.receivedQty;
    }

    for (const ret of returnedItems) {
      const itemId = ret.item;
      const qty = parseInt(ret.returnQty);

      if (!grnItemsMap[itemId]) {
        return res.status(400).json({ message: `Item ${itemId} not in GRN` });
      }

      if (qty > grnItemsMap[itemId]) {
        return res.status(400).json({
          message: `Returned qty ${qty} exceeds received for item ${itemId}`,
        });
      }

      await decreaseStock(itemId, qty, "PurchaseReturn", null, warehouse);
    }

    const purchaseReturn = new PurchaseReturn({
      grn,
      returnedItems,
      remarks,
      warehouse,
      createdBy,
    });

    await purchaseReturn.save();

    for (const ret of returnedItems) {
      await StockLedger.create({
        item: ret.item,
        quantity: ret.returnQty,
        warehouse,
        transactionType: "RETURN",
        source: "PurchaseReturn",
        sourceId: purchaseReturn._id,
        timestamp: new Date(),
      });
    }

    return res.status(201).json({
      message: "✅ Purchase Return recorded successfully.",
      purchaseReturn,
    });
  } catch (err) {
    console.error("❌ Error in createPurchaseReturn:", err);

    if (err.code === "INSUFFICIENT_STOCK") {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({
      message: "Failed to process return",
      error: err.message,
    });
  }
};
// 📄 Get All Purchase Returns
export const getAllReturns = async (req, res) => {
  try {
    const returns = await PurchaseReturn.find()
      .populate({
        path: "grn",
        populate: {
          path: "purchaseOrder",
          populate: {
            path: "vendor",
            select: "name",
          },
        },
      })
      .populate("returnedItems.item", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(returns);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch returns",
      error: err.message,
    });
  }
};
