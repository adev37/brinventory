// === File: backend/routes/stockTransferRoutes.js ===

import express from "express";
import { transferStock } from "../controllers/stockTransferController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🛠️ Stock transfer POST: /api/stocks/transfer
router.post("/", protect, transferStock);

export default router;
