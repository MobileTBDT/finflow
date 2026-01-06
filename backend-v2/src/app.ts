import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import transactionsRoutes from "./routes/transactions.routes";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/transactions", transactionsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "FinFlow API v2 - Express + Prisma + PostgreSQL",
    database: "PostgreSQL",
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
      transactions: "GET /transactions (protected)",
      createTransaction: "POST /transactions (protected)",
    },
  });
});

export default app;
