"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const categories_controller_1 = require("../controllers/categories.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
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
router.get("/", categories_controller_1.getCategories);
exports.default = router;
