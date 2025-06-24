import express from "express";
import { getStockLedger } from "../controllers/stockLedgerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getStockLedger);

export default router;
