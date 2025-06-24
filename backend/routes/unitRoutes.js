import express from "express";
import { createUnit, getUnits } from "../controllers/unitController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getUnits);
router.post("/", adminOnly, createUnit);

export default router;
