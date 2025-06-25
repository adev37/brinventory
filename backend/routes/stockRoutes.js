// === File: backend/routes/stockRoutes.js ===

import express from "express";
import {
  getAllStock,
  getStockByWarehouse,
} from "../controllers/stockController.js";

const router = express.Router();

// 📦 Routes for stock reporting
router.get("/", getAllStock); // 👉 GET /api/stocks
router.get("/by-warehouse", getStockByWarehouse); // 👉 GET /api/stocks/by-warehouse

export default router;
