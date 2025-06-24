import express from "express";
import {
  addClient,
  getAllClients,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // Protect all client routes
router.post("/", addClient);
router.get("/", getAllClients);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
