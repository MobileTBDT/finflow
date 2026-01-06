import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

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

app.get("/", (req, res) => {
  res.json({
    message: "FinFlow API v2 - Express + Prisma + PostgreSQL",
    database: "PostgreSQL",
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
    },
  });
});

export default app;
