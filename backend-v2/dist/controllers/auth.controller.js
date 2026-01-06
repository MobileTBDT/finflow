"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-change-this";
async function register(req, res) {
    try {
        const { username, email, password, fullname, phone, dateofbirth, image } = req.body;
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
        const accessToken = jsonwebtoken_1.default.sign({ sub: user.id, username }, JWT_SECRET, {
            expiresIn: "7d",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, username }, JWT_REFRESH_SECRET, { expiresIn: "30d" });
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
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
async function login(req, res) {
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
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = jsonwebtoken_1.default.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
        const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, username: user.username }, JWT_REFRESH_SECRET, { expiresIn: "30d" });
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
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
}
// Tạo default categories khi user đăng ký
async function createDefaultCategories(userId) {
    const defaultCategories = [
        // EXPENSE categories
        { name: "Food", type: "EXPENSE", icon: "🍔" },
        { name: "Grocery", type: "EXPENSE", icon: "🛒" },
        { name: "Transportation", type: "EXPENSE", icon: "🚗" },
        { name: "Utilities", type: "EXPENSE", icon: "💡" },
        { name: "Rent", type: "EXPENSE", icon: "🏠" },
        { name: "Personal", type: "EXPENSE", icon: "👤" },
        { name: "Health", type: "EXPENSE", icon: "🏥" },
        { name: "Sport", type: "EXPENSE", icon: "⚽" },
        { name: "Gift", type: "EXPENSE", icon: "🎁" },
        { name: "Saving", type: "EXPENSE", icon: "💰" },
        { name: "Travel", type: "EXPENSE", icon: "✈️" },
        { name: "Shopping", type: "EXPENSE", icon: "🛍️" },
        // INCOME categories
        { name: "Salary", type: "INCOME", icon: "💵" },
        { name: "Freelance", type: "INCOME", icon: "💼" },
        { name: "Investment", type: "INCOME", icon: "📈" },
    ];
    await prisma.category.createMany({
        data: defaultCategories.map((cat) => ({
            ...cat,
            userId,
        })),
    });
}
