// === Updated stockController.js ===

import Stock from "../models/Stock.js";
import Item from "../models/Item.js";
import Category from "../models/Category.js";

// 📊 GET TOTAL STOCK (by item, across warehouses)
// 📊 GET TOTAL STOCK (by item, across warehouses)
export const getAllStock = async (req, res) => {
  try {
    const stockList = await Stock.find().populate({
      path: "item",
      select: "name sku unit lowStockThreshold category",
      populate: {
        path: "category",
        model: "Category",
        select: "name", // 🆕 Ensure name is included
      },
    });

    const stockSummary = {};

    stockList.forEach((entry) => {
      if (!entry.item || !entry.item._id) return;

      const itemId = entry.item._id.toString();

      if (!stockSummary[itemId]) {
        stockSummary[itemId] = {
          _id: itemId,
          name: entry.item.name,
          sku: entry.item.sku,
          unit: entry.item.unit,
          lowAlert: entry.item.lowStockThreshold || 0,
          quantity: 0,
          category: entry.item.category || null,
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

// 📦 GET STOCK BY ITEM AND WAREHOUSE
export const getStockByWarehouse = async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate("item", "name")
      .populate("warehouse", "name");

    const grouped = {};

    stock.forEach((entry) => {
      const itemName = entry.item?.name || "Unnamed";
      const warehouseName = entry.warehouse?.name || "Unknown";

      if (!grouped[itemName]) grouped[itemName] = {};
      grouped[itemName][warehouseName] =
        (grouped[itemName][warehouseName] || 0) + entry.quantity;
    });

    res.json(grouped);
  } catch (err) {
    console.error("❌ Error fetching stock by warehouse:", err);
    res.status(500).json({
      message: "Failed to fetch stock",
      error: err.message,
    });
  }
};

// 🚨 GET LOW STOCK CATEGORIES
export const getLowStockCategories = async (req, res) => {
  try {
    const stockList = await Stock.find().populate({
      path: "item",
      populate: {
        path: "category",
        model: "Category",
      },
    });

    const lowCategories = new Set();

    for (const entry of stockList) {
      if (!entry.item || !entry.item.category) continue;

      const { lowStockThreshold = 5 } = entry.item;
      if (entry.quantity <= lowStockThreshold) {
        lowCategories.add(entry.item.category.name);
      }
    }

    res.json(Array.from(lowCategories));
  } catch (err) {
    console.error("❌ Error fetching low stock categories:", err);
    res.status(500).json({
      message: "Failed to get low stock categories",
      error: err.message,
    });
  }
};
