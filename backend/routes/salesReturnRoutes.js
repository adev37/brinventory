import express from "express";
import {
  createSalesReturn,
  getSalesReturns,
  getEligibleInvoicesForReturn, // ✅ Add this
} from "../controllers/salesReturnController.js";

import { protect } from "../middleware/authMiddleware.js"; // if you're using protected routes

const router = express.Router();

router.post("/", protect, createSalesReturn);
router.get("/", protect, getSalesReturns);

// ✅ NEW: Route to fetch only eligible invoices
router.get("/eligible-invoices", protect, getEligibleInvoicesForReturn);

export default router;
