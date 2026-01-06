"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getCategories(req, res) {
    try {
        const userId = req.user.sub;
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: "asc" },
        });
        res.json(categories);
    }
    catch (err) {
        console.error("Get categories error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
