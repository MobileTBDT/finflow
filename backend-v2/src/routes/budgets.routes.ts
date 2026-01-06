import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getBudgets,
  createOrUpdateBudget,
  deleteBudget,
} from "../controllers/budgets.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getBudgets);
router.post("/", createOrUpdateBudget);
router.delete("/:id", deleteBudget);

export default router;
