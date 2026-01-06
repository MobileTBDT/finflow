import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinFlow API",
      version: "2.0.0",
      description:
        "Personal Finance Management API - Express + Prisma + PostgreSQL",
      contact: {
        name: "FinFlow Team",
        email: "support@finflow.app",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://example.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "john_doe" },
            email: { type: "string", example: "john@example.com" },
            fullname: { type: "string", example: "John Doe" },
            phone: { type: "string", nullable: true, example: "0123456789" },
            dateofbirth: {
              type: "string",
              format: "date",
              nullable: true,
              example: "1990-01-15",
            },
            image: {
              type: "string",
              nullable: true,
              example: "https://example.com/avatar.jpg",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Food" },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
              example: "EXPENSE",
            },
            icon: { type: "string", example: "🍔" },
            userId: { type: "integer", example: 1 },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            amount: { type: "number", example: 50000 },
            date: { type: "string", format: "date", example: "2026-01-06" },
            note: {
              type: "string",
              nullable: true,
              example: "Lunch at restaurant",
            },
            userId: { type: "integer", example: 1 },
            categoryId: { type: "integer", example: 1 },
            category: { $ref: "#/components/schemas/Category" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Budget: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            amount: { type: "number", example: 500000 },
            month: { type: "string", example: "2026-01" },
            userId: { type: "integer", example: 1 },
            categoryId: { type: "integer", example: 1 },
            category: { $ref: "#/components/schemas/Category" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error message" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
