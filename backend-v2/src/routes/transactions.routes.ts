import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getTransactions,
  createTransaction,
} from "../controllers/transactions.controller";

const router = Router();

router.use(authMiddleware); // Protect all routes

router.get("/", getTransactions);
router.post("/", createTransaction);

export default router;
