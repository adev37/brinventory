// routes/purchaseReturnRoutes.js
import express from "express";
import {
  createPurchaseReturn,
  getAllReturns,
} from "../controllers/purchaseReturnController.js";

const router = express.Router();

// Create a purchase return
router.post("/", createPurchaseReturn);

// Get all purchase returns
router.get("/", getAllReturns);

export default router;
