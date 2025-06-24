import express from "express";
import {
  createVendorQuotation,
  getAllVendorQuotations,
  getVendorQuotationById,
  updateVendorQuotationStatus,
} from "../controllers/vendorQuotationController.js";

const router = express.Router();

router.post("/", createVendorQuotation);
router.get("/", getAllVendorQuotations);
router.get("/:id", getVendorQuotationById);
router.patch("/:id/status", updateVendorQuotationStatus);

export default router;
