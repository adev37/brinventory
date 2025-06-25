// === File: backend/controllers/goodsReceiptController.js ===

import GoodsReceipt from "../models/GoodsReceipt.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import PurchaseReturn from "../models/PurchaseReturn.js";
import Warehouse from "../models/Warehouse.js";
import { increaseStock } from "../utils/stockHelpers.js"; // ✅ already handles ledger
import mongoose from "mongoose";

export const createGoodsReceipt = async (req, res) => {
  try {
    const { purchaseOrder, receivedItems, remarks, createdBy, warehouseId } =
      req.body;

    // 1. Validate Warehouse
    const warehouseExists = await Warehouse.findById(warehouseId);
    if (!warehouseExists) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    // 2. Fetch the purchase order
    const po = await PurchaseOrder.findById(purchaseOrder);
    if (!po)
      return res.status(404).json({ message: "Purchase Order not found" });

    // 3. Check already received quantities
    const existingReceipts = await GoodsReceipt.find({ purchaseOrder });
    const previouslyReceived = {};
    for (const receipt of existingReceipts) {
      for (const ri of receipt.receivedItems) {
        const itemId = ri.item.toString();
        previouslyReceived[itemId] =
          (previouslyReceived[itemId] || 0) + ri.receivedQty;
      }
    }

    // 4. Validate and update stock
    for (const r of receivedItems) {
      const itemId = r.item.toString();
      const already = previouslyReceived[itemId] || 0;
      const poItem = po.items.find((i) => i.item.toString() === itemId);

      if (!poItem) {
        return res
          .status(400)
          .json({ message: `Item ${itemId} not in purchase order` });
      }

      const totalAfter = already + r.receivedQty;
      if (totalAfter > poItem.quantity) {
        return res.status(400).json({
          message: `Receiving ${r.receivedQty} of item ${itemId} exceeds ordered qty`,
        });
      }
    }

    // 5. Create GRN first
    const receipt = new GoodsReceipt({
      purchaseOrder,
      receivedItems,
      remarks: remarks || "",
      warehouse: warehouseId,
      createdBy: createdBy || null,
    });
    await receipt.save();

    // 6. Increase stock and auto-log in StockLedger via `increaseStock`
    for (const r of receivedItems) {
      await increaseStock(
        r.item,
        r.receivedQty,
        "GRN",
        receipt._id,
        warehouseId,
        createdBy,
        remarks || `Received from PO ${po.poNumber}`,
        `GRN#${receipt._id.toString().slice(-4)}`
      );
    }

    // 7. Update PO status
    let totalOrdered = 0;
    let totalReceived = 0;
    for (const item of po.items) {
      totalOrdered += item.quantity;
      const rec = previouslyReceived[item.item.toString()] || 0;
      const additional =
        receivedItems.find((ri) => ri.item.toString() === item.item.toString())
          ?.receivedQty || 0;
      totalReceived += rec + additional;
    }

    if (totalReceived >= totalOrdered) {
      po.status = "Received";
    } else if (totalReceived > 0) {
      po.status = "Partially Received";
    }
    await po.save();

    return res.status(201).json({
      message: "✅ Goods received and stock updated.",
      receipt,
    });
  } catch (error) {
    console.error("❌ Error in createGoodsReceipt:", error);
    return res.status(500).json({
      message: "Failed to create goods receipt",
      error: error.message,
    });
  }
};

// 📄 GET all GRNs
export const getAllReceipts = async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find()
      .populate({
        path: "purchaseOrder",
        populate: { path: "vendor", select: "name email" },
      })
      .populate("receivedItems.item", "name sku")
      .sort({ createdAt: -1 });

    return res.status(200).json(receipts);
  } catch (err) {
    console.error("❌ Error in getAllReceipts:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch GRNs", error: err.message });
  }
};

// 📄 GET single GRN by ID
export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await GoodsReceipt.findById(id)
      .populate({
        path: "purchaseOrder",
        populate: { path: "vendor", select: "name email" },
      })
      .populate("receivedItems.item", "name sku");

    if (!receipt) {
      return res.status(404).json({ message: "Goods Receipt not found" });
    }

    res.status(200).json(receipt);
  } catch (error) {
    console.error("❌ Error in getGoodsReceiptById:", error);
    res.status(500).json({
      message: "Failed to fetch goods receipt by ID",
      error: error.message,
    });
  }
};

// 📦 GET GRNs eligible for Purchase Return
export const getPendingReturnGRNs = async (req, res) => {
  try {
    const grns = await GoodsReceipt.find()
      .populate("purchaseOrder")
      .populate("receivedItems.item");

    const returns = await PurchaseReturn.find();

    const grnReturnMap = {};
    for (const ret of returns) {
      if (!ret.grn || !Array.isArray(ret.returnedItems)) continue;

      const grnId = ret.grn.toString();
      grnReturnMap[grnId] = grnReturnMap[grnId] || {};

      for (const item of ret.returnedItems) {
        const itemId = item.item.toString();
        grnReturnMap[grnId][itemId] =
          (grnReturnMap[grnId][itemId] || 0) + item.returnQty;
      }
    }

    const eligibleGRNs = grns
      .map((grn) => {
        const grnId = grn._id.toString();

        const updatedItems = grn.receivedItems
          .map((ri) => {
            const itemId = ri.item._id.toString();
            const receivedQty = ri.receivedQty;
            const returnedQty = grnReturnMap[grnId]?.[itemId] || 0;
            const remainingQty = receivedQty - returnedQty;

            if (remainingQty <= 0) return null;

            return {
              ...ri.toObject(),
              returnedQty,
              remainingQty,
            };
          })
          .filter(Boolean);

        if (updatedItems.length === 0) return null;

        return {
          ...grn.toObject(),
          receivedItems: updatedItems,
        };
      })
      .filter(Boolean);

    res.status(200).json(eligibleGRNs);
  } catch (err) {
    console.error("❌ Error fetching GRNs with pending returns:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
