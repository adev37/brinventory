import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getNextInvoiceNumber, // ✅ valid
  getAvailableDeliveryChallans, // ✅ valid
} from "../controllers/salesInvoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInvoice);
router.get("/", protect, getAllInvoices);
router.get("/available-dcs", protect, getAvailableDeliveryChallans); // ✅ fixed
router.get("/next-number", protect, getNextInvoiceNumber); // ✅ added protect if needed

export default router;
