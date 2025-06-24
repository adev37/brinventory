import express from "express";
import {
  createGoodsReceipt,
  getAllReceipts,
  getReceiptById, // 👈 add this
  getPendingReturnGRNs,
} from "../controllers/goodsReceiptController.js";

const router = express.Router();

router.post("/", createGoodsReceipt);
router.get("/", getAllReceipts);
router.get("/:id", getReceiptById); // 👈 this is the missing endpoint
router.get("/pending-returns", getPendingReturnGRNs); // 👈 New route

export default router;
