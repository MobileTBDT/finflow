import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

import prisma from "../client";

// GET /budgets?month=2026-01
export async function getBudgets(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;
    const month = (req.query.month as string) || getCurrentMonth();

    const budgets = await prisma.budget.findMany({
      where: { userId, month },
      include: { category: true },
    });

    res.json(budgets);
  } catch (err: any) {
    console.error("Get budgets error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

// POST /budgets
export async function createOrUpdateBudget(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;
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
  } catch (err: any) {
    console.error("Create/update budget error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

// DELETE /budgets/:id
export async function deleteBudget(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;
    const budgetId = Number(req.params.id);

    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await prisma.budget.delete({ where: { id: budgetId } });

    res.json({ message: "Budget deleted successfully" });
  } catch (err: any) {
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
