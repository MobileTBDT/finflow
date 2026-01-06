import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getTransactions,
  createTransaction,
} from "../controllers/transactions.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get user's transactions
 *     description: Retrieve all transactions for authenticated user (max 100)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", getTransactions);

/**
 * @openapi
 * /transactions:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create new transaction
 *     description: Create a new income or expense transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - date
 *               - categoryId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50000
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-06"
 *               note:
 *                 type: string
 *                 example: Lunch at restaurant
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", createTransaction);

export default router;
