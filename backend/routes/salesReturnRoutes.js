import express from "express";
import {
  createSalesReturn,
  getSalesReturns,
  getEligibleInvoicesForReturn,
} from "../controllers/salesReturnController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📦 Create a new sales return
router.post("/", protect, createSalesReturn);

// 📄 Get all sales returns with client and item details
router.get("/", protect, getSalesReturns);

// 🧾 Get eligible invoices for return (i.e., not fully returned)
router.get("/eligible-invoices", protect, getEligibleInvoicesForReturn);

export default router;
