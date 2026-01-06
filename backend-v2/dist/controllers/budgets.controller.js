"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgets = getBudgets;
exports.createOrUpdateBudget = createOrUpdateBudget;
exports.deleteBudget = deleteBudget;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /budgets?month=2026-01
async function getBudgets(req, res) {
    try {
        const userId = req.user.sub;
        const month = req.query.month || getCurrentMonth();
        const budgets = await prisma.budget.findMany({
            where: { userId, month },
            include: { category: true },
        });
        res.json(budgets);
    }
    catch (err) {
        console.error("Get budgets error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
// POST /budgets
async function createOrUpdateBudget(req, res) {
    try {
        const userId = req.user.sub;
        const { categoryId, amount, month } = req.body;
        if (!categoryId || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const budgetMonth = month || getCurrentMonth();
        const budget = await prisma.budget.upsert({
            where: {
                userId_categoryId_month: {
                    userId,
                    categoryId: Number(categoryId),
                    month: budgetMonth,
                },
            },
            update: { amount: Number(amount) },
            create: {
                userId,
                categoryId: Number(categoryId),
                amount: Number(amount),
                month: budgetMonth,
            },
            include: { category: true },
        });
        res.json(budget);
    }
    catch (err) {
        console.error("Create/update budget error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
// DELETE /budgets/:id
async function deleteBudget(req, res) {
    try {
        const userId = req.user.sub;
        const budgetId = Number(req.params.id);
        const budget = await prisma.budget.findFirst({
            where: { id: budgetId, userId },
        });
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }
        await prisma.budget.delete({ where: { id: budgetId } });
        res.json({ message: "Budget deleted successfully" });
    }
    catch (err) {
        console.error("Delete budget error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}
