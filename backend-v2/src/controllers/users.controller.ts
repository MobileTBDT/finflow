import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET /users/me
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;

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
  } catch (err: any) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

// PUT /users/me
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;
    const { fullname, phone, dateofbirth, image } = req.body;

    const updateData: any = {};
    if (fullname !== undefined) updateData.fullname = fullname;
    if (phone !== undefined) updateData.phone = phone || null;
    if (dateofbirth !== undefined)
      updateData.dateofbirth = dateofbirth ? new Date(dateofbirth) : null;
    if (image !== undefined) updateData.image = image || null;

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
  } catch (err: any) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}

// PUT /users/me/password
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.sub;
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

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    console.error("Change password error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}
