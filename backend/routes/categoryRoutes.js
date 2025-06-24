import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getCategories);
router.post("/", adminOnly, createCategory);

export default router;
