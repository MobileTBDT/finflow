import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-change-this";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, fullname, phone, dateofbirth, image } =
      req.body;

    if (!username || !email || !password || !fullname) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullname,
        phone: phone || null,
        dateofbirth: dateofbirth ? new Date(dateofbirth) : null,
        image: image || null,
      },
    });

    // Create default categories
    await createDefaultCategories(user.id);

    const accessToken = jwt.sign({ sub: user.id, username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshToken = jwt.sign(
      { sub: user.id, username },
      JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(201).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      info: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        dateofbirth: user.dateofbirth,
        image: user.image,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      info: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        dateofbirth: user.dateofbirth,
        image: user.image,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

// Tạo default categories khi user đăng ký
async function createDefaultCategories(userId: number) {
  const defaultCategories = [
    // EXPENSE categories
    { name: "Food", type: "EXPENSE" as const, icon: "🍔" },
    { name: "Grocery", type: "EXPENSE" as const, icon: "🛒" },
    { name: "Transportation", type: "EXPENSE" as const, icon: "🚗" },
    { name: "Utilities", type: "EXPENSE" as const, icon: "💡" },
    { name: "Rent", type: "EXPENSE" as const, icon: "🏠" },
    { name: "Personal", type: "EXPENSE" as const, icon: "👤" },
    { name: "Health", type: "EXPENSE" as const, icon: "🏥" },
    { name: "Sport", type: "EXPENSE" as const, icon: "⚽" },
    { name: "Gift", type: "EXPENSE" as const, icon: "🎁" },
    { name: "Saving", type: "EXPENSE" as const, icon: "💰" },
    { name: "Travel", type: "EXPENSE" as const, icon: "✈️" },
    { name: "Shopping", type: "EXPENSE" as const, icon: "🛍️" },

    // INCOME categories
    { name: "Salary", type: "INCOME" as const, icon: "💵" },
    { name: "Freelance", type: "INCOME" as const, icon: "💼" },
    { name: "Investment", type: "INCOME" as const, icon: "📈" },
  ];

  await prisma.category.createMany({
    data: defaultCategories.map((cat) => ({
      ...cat,
      userId,
    })),
  });
}
