import express from "express";
import {
  getAllStock,
  getStockByWarehouse,
  transferStock,
} from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getAllStock); // GET all stocks
router.get("/by-warehouse", getStockByWarehouse); // GET grouped stocks
router.post("/transfer", transferStock); // POST stock transfer

export default router;
