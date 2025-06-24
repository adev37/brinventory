import express from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  bulkCreateItems,
  getItemsWithStock,
} from "../controllers/itemController.js";

const router = express.Router();

// ✅ Use authentication middleware if needed
// router.use(protect);

// ✅ Routes

// Get items along with current stock details (merged with Stock model)
router.get("/with-stock", getItemsWithStock);

// Bulk insert items (initial stock defaults to 0)
router.post("/bulk", bulkCreateItems);

// CRUD routes
router.get("/", getAllItems); // Get all items (no stock)
router.get("/:id", getItemById); // Get single item
router.post("/", createItem); // Add new item (stock handled separately)
router.put("/:id", updateItem); // Update item info
router.delete("/:id", deleteItem); // Delete item and its stock

export default router;
