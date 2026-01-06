"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const budgets_controller_1 = require("../controllers/budgets.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
/**
 * @openapi
 * /budgets:
 *   get:
 *     tags:
 *       - Budgets
 *     summary: Get user's budgets
 *     description: Retrieve budgets for a specific month
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2026-01"
 *         description: Month in YYYY-MM format (defaults to current month)
 *     responses:
 *       200:
 *         description: Budgets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", budgets_controller_1.getBudgets);
/**
 * @openapi
 * /budgets:
 *   post:
 *     tags:
 *       - Budgets
 *     summary: Create or update budget
 *     description: Create new budget or update existing one (upsert by user, category, month)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - amount
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 500000
 *               month:
 *                 type: string
 *                 example: "2026-01"
 *                 description: Defaults to current month if not provided
 *     responses:
 *       200:
 *         description: Budget created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", budgets_controller_1.createOrUpdateBudget);
/**
 * @openapi
 * /budgets/{id}:
 *   delete:
 *     tags:
 *       - Budgets
 *     summary: Delete budget
 *     description: Delete a specific budget by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", budgets_controller_1.deleteBudget);
exports.default = router;
