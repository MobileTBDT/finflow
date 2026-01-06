import { apiGet, apiPost } from "./api";

export type Transaction = {
  id: number;
  amount: number;
  date: string;
  note?: string;
  userId: number;
  categoryId: number;
  createdAt: string;
  category: {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string;
  };
};

export type CreateTransactionPayload = {
  amount: number;
  date: string; // "YYYY-MM-DD"
  note?: string;
  categoryId: number;
};

export async function getTransactions(token: string) {
  return apiGet<Transaction[]>("/transactions", token);
}

export async function createTransaction(
  payload: CreateTransactionPayload,
  token: string
) {
  return apiPost<Transaction>("/transactions", payload, token);
}
