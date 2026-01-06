import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/users.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieve authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 */
router.get("/me", getProfile);

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update current user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: John Doe Updated
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               dateofbirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-20"
 *               image:
 *                 type: string
 *                 example: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/me", updateProfile);

/**
 * @openapi
 * /users/me/password:
 *   put:
 *     tags:
 *       - Users
 *     summary: Change password
 *     description: Change current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found
 */
router.put("/me/password", changePassword);

export default router;
