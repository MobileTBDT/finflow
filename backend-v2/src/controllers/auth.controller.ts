import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/jwt.utils";

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, fullname, phone, dateofbirth, image } =
      req.body;

    // Validate required
    if (!username || !email || !password || !fullname) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existing) {
      if (existing.username === username)
        return res.status(400).json({ message: "Username already exists" });
      if (existing.email === email)
        return res.status(400).json({ message: "Email already exists" });
      if (existing.phone === phone)
        return res.status(400).json({ message: "Phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
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

    const accessToken = signAccessToken(newUser.id, newUser.username);
    const refreshToken = signRefreshToken(newUser.id, newUser.username);

    const rtHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken: rtHash },
    });

    // Create default categories
    await createDefaultCategories(newUser.id);

    const { password: _, refreshToken: __, ...userInfo } = newUser;

    res.status(201).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      info: userInfo,
    });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username: identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user.id, user.username);
    const refreshToken = signRefreshToken(user.id, user.username);

    const rtHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: rtHash },
    });

    const { password: _, refreshToken: __, ...userInfo } = user;

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      info: userInfo,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

async function createDefaultCategories(userId: number) {
  const defaults = [
    { name: "Food & Dining", type: "EXPENSE", icon: "🍔" },
    { name: "Transportation", type: "EXPENSE", icon: "🚗" },
    { name: "Shopping", type: "EXPENSE", icon: "🛍️" },
    { name: "Entertainment", type: "EXPENSE", icon: "🎬" },
    { name: "Bills & Utilities", type: "EXPENSE", icon: "💡" },
    { name: "Healthcare", type: "EXPENSE", icon: "🏥" },
    { name: "Salary", type: "INCOME", icon: "💰" },
    { name: "Freelance", type: "INCOME", icon: "💼" },
    { name: "Investment", type: "INCOME", icon: "📈" },
  ];

  await prisma.category.createMany({
    data: defaults.map((c) => ({ ...c, userId })),
  });
}
