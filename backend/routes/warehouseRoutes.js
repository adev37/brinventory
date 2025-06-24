import express from "express";
import {
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouseController.js";
import * as auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.post("/", auth.protect, createWarehouse);
router.get("/", auth.protect, getAllWarehouses);
router.put("/:id", auth.protect, updateWarehouse);
router.delete("/:id", auth.protect, deleteWarehouse);

export default router;
