import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

import prisma from "../client";

export async function getCategories(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (err: any) {
    console.error("Get categories error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}
