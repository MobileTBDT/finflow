"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// GET /users/me
async function getProfile(req, res) {
    try {
        const userId = req.user.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                fullname: true,
                phone: true,
                dateofbirth: true,
                image: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
// PUT /users/me
async function updateProfile(req, res) {
    try {
        const userId = req.user.sub;
        const { fullname, phone, dateofbirth, image } = req.body;
        const updateData = {};
        if (fullname !== undefined)
            updateData.fullname = fullname;
        if (phone !== undefined)
            updateData.phone = phone || null;
        if (dateofbirth !== undefined)
            updateData.dateofbirth = dateofbirth ? new Date(dateofbirth) : null;
        if (image !== undefined)
            updateData.image = image || null;
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                fullname: true,
                phone: true,
                dateofbirth: true,
                image: true,
            },
        });
        res.json(user);
    }
    catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
// PUT /users/me/password
async function changePassword(req, res) {
    try {
        const userId = req.user.sub;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.json({ message: "Password changed successfully" });
    }
    catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
