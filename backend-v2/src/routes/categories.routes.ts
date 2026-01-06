import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getCategories } from "../controllers/categories.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get user's categories
 *     description: Retrieve all categories for authenticated user (sorted by name)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", getCategories);

export default router;
