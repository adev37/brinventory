// backend/routes/stockAdjustmentRoutes.js

import express from "express";
import {
  createAdjustment,
  getAdjustments,
} from "../controllers/stockAdjustmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/stock-adjustments
// @desc    Create a stock adjustment
// @access  Private
router.post("/", protect, createAdjustment);

// @route   GET /api/stock-adjustments
// @desc    Get all stock adjustments
// @access  Private
router.get("/", protect, getAdjustments);

export default router;
