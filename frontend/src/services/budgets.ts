import { apiGet, apiPost, apiDelete } from "./api";

export type Budget = {
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  month: string;
  category: {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string;
  };
};

export type CreateBudgetPayload = {
  categoryId: number;
  amount: number;
  month?: string; // "2026-01"
};

export async function getBudgets(token: string, month?: string) {
  const query = month ? `?month=${month}` : "";
  return apiGet<Budget[]>(`/budgets${query}`, token);
}

export async function createOrUpdateBudget(
  payload: CreateBudgetPayload,
  token: string
) {
  return apiPost<Budget>("/budgets", payload, token);
}

export async function deleteBudget(budgetId: number, token: string) {
  return apiDelete(`/budgets/${budgetId}`, token);
}
