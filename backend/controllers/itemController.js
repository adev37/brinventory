// backend/controllers/itemController.js
import Item from "../models/Item.js";
import Stock from "../models/Stock.js";

// @desc    Add new item
// @route   POST /api/items
// @access  Private
export const createItem = async (req, res) => {
  try {
    const {
      name,
      sku,
      unit,
      category,
      description,
      pricePerUnit,
      lowStockThreshold,
      gst,
    } = req.body;

    const exists = await Item.findOne({ sku });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Item with this SKU already exists" });
    }

    // Create Item
    const item = new Item({
      name,
      sku,
      unit,
      category,
      description,
      pricePerUnit,
      lowStockThreshold,
      gst,
      createdBy: req.user?._id || null,
    });

    const savedItem = await item.save();

    // ✅ Create initial Stock entry with 0 quantity
    await new Stock({
      item: savedItem._id,
      quantity: 0,
      lastUpdatedBy: req.user?.name || "System",
      remarks: "Initial stock entry created with 0 quantity",
    }).save();

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to create item", error });
  }
};
// @desc    Bulk add items (with initial stock as 0)
// @route   POST /api/items/bulk
// @access  Private
export const bulkCreateItems = async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const skus = items.map((item) => item.sku);
    const existingItems = await Item.find({ sku: { $in: skus } });

    if (existingItems.length > 0) {
      const duplicates = existingItems.map((item) => item.sku);
      return res.status(400).json({
        message: "Duplicate SKUs found",
        duplicates,
      });
    }

    const enrichedItems = items.map((item) => ({
      ...item,
      createdBy: req.user?._id || null,
    }));

    const insertedItems = await Item.insertMany(enrichedItems);

    // ✅ Create stock entries with quantity = 0
    const stockEntries = insertedItems.map((item) => ({
      item: item._id,
      quantity: 0,
      lastUpdatedBy: req.user?.name || "Admin",
      remarks: "Initial stock from bulk add",
    }));

    await Stock.insertMany(stockEntries);

    res.status(201).json(insertedItems);
  } catch (error) {
    res.status(500).json({
      message: "Failed to insert bulk items",
      error: error.message,
    });
  }
};
// @desc    Get all items
// @route   GET /api/items
// @access  Private
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error });
  }
};
// @desc    Delete item and its stock entry
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    // Check if item exists
    const deletedItem = await Item.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete associated stock record
    await Stock.deleteOne({ item: itemId });

    res.status(200).json({ message: "✅ Item and stock deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "❌ Failed to delete item",
      error: error.message,
    });
  }
};
// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("category");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({
      message: "❌ Failed to fetch item by ID",
      error: error.message,
    });
  }
};
// @desc    Get items enriched with stock data
// @route   GET /api/items/with-stock
// @access  Private
export const getItemsWithStock = async (req, res) => {
  try {
    const items = await Item.find().populate("category");
    const stocks = await Stock.find();

    // Create a map of itemId → stock
    const stockMap = new Map();
    for (const stock of stocks) {
      stockMap.set(stock.item.toString(), stock);
    }

    const enrichedItems = items.map((item) => {
      const stock = stockMap.get(item._id.toString());
      return {
        ...item._doc,
        currentQty: stock?.quantity ?? 0,
        lastUpdatedBy: stock?.lastUpdatedBy || "-",
        remarks: stock?.remarks || "-",
      };
    });

    res.status(200).json(enrichedItems);
  } catch (error) {
    console.error("❌ getItemsWithStock error:", error);
    res.status(500).json({
      message: "Failed to load items with stock",
      error: error.message,
    });
  }
};
// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const updatedData = req.body;

    const updatedItem = await Item.findByIdAndUpdate(itemId, updatedData, {
      new: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("❌ Failed to update item:", error);
    res.status(500).json({
      message: "Failed to update item",
      error: error.message,
    });
  }
};
