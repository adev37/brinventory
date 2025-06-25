// === File: backend/controllers/purchaseReturnController.js ===

import PurchaseReturn from "../models/PurchaseReturn.js";
import GoodsReceipt from "../models/GoodsReceipt.js";
import { decreaseStock } from "../utils/stockHelpers.js";
import Warehouse from "../models/Warehouse.js";

export const createPurchaseReturn = async (req, res) => {
  try {
    const { grn, returnedItems, remarks, createdBy, warehouse } = req.body;

    // 1. Validate warehouse
    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    // 2. Validate GRN
    const grnDoc = await GoodsReceipt.findById(grn).populate(
      "receivedItems.item"
    );
    if (!grnDoc) {
      return res.status(404).json({ message: "GRN not found" });
    }

    // 3. Build GRN item map
    const grnItemsMap = {};
    for (const ri of grnDoc.receivedItems) {
      grnItemsMap[ri.item._id.toString()] = ri.receivedQty;
    }

    // 4. Validate return quantities
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
    }

    // 5. Save the return FIRST to get the _id
    const purchaseReturn = new PurchaseReturn({
      grn,
      returnedItems,
      remarks,
      warehouse,
      createdBy,
    });
    await purchaseReturn.save();

    const refNo = `PR#${purchaseReturn._id.toString().slice(-4)}`;

    // 6. Decrease stock and ledger log via stockController
    for (const ret of returnedItems) {
      await decreaseStock(
        ret.item,
        ret.returnQty,
        "Purchase Return",
        purchaseReturn._id,
        warehouse,
        createdBy,
        remarks || `Returned from GRN ${grnDoc._id}`,
        refNo
      );
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
    console.error("❌ Error in getAllReturns:", err);
    res.status(500).json({
      message: "Failed to fetch returns",
      error: err.message,
    });
  }
};
