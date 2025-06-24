import express from "express";
import {
  createPurchaseOrder,
  getAllPOs,
  createPOFromQuotation,
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

router.post("/", createPurchaseOrder);
router.get("/", getAllPOs);
router.post("/from-quotation", createPOFromQuotation); // ✅ NEW

export default router;
