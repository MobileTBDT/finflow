import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
import authRoutes from "./routes/auth.routes";
import transactionsRoutes from "./routes/transactions.routes";
import categoriesRoutes from "./routes/categories.routes";
import budgetsRoutes from "./routes/budgets.routes";
import usersRoutes from "./routes/users.routes";

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

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "FinFlow API Docs",
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/budgets", budgetsRoutes);
app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "FinFlow API v2 - Express + Prisma + PostgreSQL",
    database: "PostgreSQL",
    documentation: "/api-docs",
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
      profile: "GET /users/me (protected)",
      updateProfile: "PUT /users/me (protected)",
      changePassword: "PUT /users/me/password (protected)",
      transactions: "GET /transactions (protected)",
      budgets: "GET /budgets (protected)",
    },
  });
});

export default app;
