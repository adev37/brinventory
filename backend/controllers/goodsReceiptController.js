import GoodsReceipt from "../models/GoodsReceipt.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import { increaseStock } from "./stockController.js";
import PurchaseReturn from "../models/PurchaseReturn.js";
import Warehouse from "../models/Warehouse.js";

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

      // ✅ Update warehouse-aware stock
      await increaseStock(
        r.item,
        r.receivedQty,
        "GoodsReceipt",
        null,
        warehouseId
      );
    }

    // 5. Create GRN
    const receipt = new GoodsReceipt({
      purchaseOrder,
      receivedItems,
      remarks: remarks || "",
      warehouse: warehouseId,
      createdBy: createdBy || null,
    });
    await receipt.save();

    // 6. Update PO status
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
      message: "✅ Goods received successfully and stock updated.",
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

// GET /api/goods-receipts/:id
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

export const getPendingReturnGRNs = async (req, res) => {
  try {
    // Step 1: Load all GRNs and all purchase returns
    const grns = await GoodsReceipt.find()
      .populate("purchaseOrder")
      .populate("receivedItems.item");

    const returns = await PurchaseReturn.find();

    // Step 2: Build map of returned quantities for each item per GRN
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

    // Step 3: Enrich GRNs by keeping only items with remainingQty > 0
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
          .filter(Boolean); // remove items with 0 remaining

        if (updatedItems.length === 0) return null;

        return {
          ...grn.toObject(),
          receivedItems: updatedItems,
        };
      })
      .filter(Boolean); // remove GRNs with no eligible items

    // Step 4: Return enriched GRNs
    res.status(200).json(eligibleGRNs);
  } catch (err) {
    console.error("❌ Error fetching GRNs with pending returns:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
