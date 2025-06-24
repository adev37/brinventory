import express from "express";
import {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  getUndeliveredSalesOrders, // ✅
} from "../controllers/salesOrderController.js";

const router = express.Router();

router.post("/", createSalesOrder);
router.get("/", getAllSalesOrders);
router.get("/undelivered", getUndeliveredSalesOrders); // ✅
router.get("/:id", getSalesOrderById);

export default router;
