// backend/routes/deliveryChallanRoutes.js
import express from "express";
import {
  createChallan,
  getChallans,
} from "../controllers/deliveryChallanController.js";

const router = express.Router();

router.post("/", createChallan);
router.get("/", getChallans);

export default router;
