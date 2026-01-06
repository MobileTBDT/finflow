"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("./config/swagger.config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const transactions_routes_1 = __importDefault(require("./routes/transactions.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const budgets_routes_1 = __importDefault(require("./routes/budgets.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Swagger UI
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "FinFlow API Docs",
}));
// Routes
app.use("/auth", auth_routes_1.default);
app.use("/transactions", transactions_routes_1.default);
app.use("/categories", categories_routes_1.default);
app.use("/budgets", budgets_routes_1.default);
app.use("/users", users_routes_1.default);
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
exports.default = app;
