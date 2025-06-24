import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser); // optional
router.put("/:id", updateUser);

export default router;
