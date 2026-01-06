import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getCategories } from "../controllers/categories.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getCategories);

export default router;
