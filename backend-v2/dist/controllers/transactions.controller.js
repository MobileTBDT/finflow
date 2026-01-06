"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = getTransactions;
exports.createTransaction = createTransaction;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getTransactions(req, res) {
    try {
        const userId = req.user.sub;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: "desc" },
            take: 100,
        });
        res.json(transactions);
    }
    catch (err) {
        console.error("Get transactions error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
async function createTransaction(req, res) {
    try {
        const userId = req.user.sub;
        const { amount, date, note, categoryId } = req.body;
        if (!amount || !date || !categoryId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const transaction = await prisma.transaction.create({
            data: {
                amount,
                date: new Date(date),
                note: note || null,
                userId,
                categoryId,
            },
            include: { category: true },
        });
        res.status(201).json(transaction);
    }
    catch (err) {
        console.error("Create transaction error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
