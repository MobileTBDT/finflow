import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/users.controller";

const router = Router();

router.use(authMiddleware);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.put("/me/password", changePassword);

export default router;
