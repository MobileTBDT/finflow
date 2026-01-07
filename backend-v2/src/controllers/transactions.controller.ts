import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

import prisma from "../client";

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 100,
    });

    res.json(transactions);
  } catch (err: any) {
    console.error("Get transactions error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

export async function createTransaction(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;
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
  } catch (err: any) {
    console.error("Create transaction error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}
