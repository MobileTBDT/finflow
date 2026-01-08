import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BudgetCategoryDetailScreen from "../BudgetCategoryDetailScreen";
import { getTransactions } from "../../services/transactions";
import { getBudgets } from "../../services/budgets";
import { getTokens } from "../../services/tokenStorage";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { categoryId: "food" } }),
  useFocusEffect: jest.fn(cb => cb()),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/budgets");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("BudgetCategoryDetailScreen", () => {
  beforeEach(() => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getTransactions as jest.Mock).mockResolvedValue([
      { id: 1, amount: 100, date: new Date().toISOString(), createdAt: new Date().toISOString(), note: "Lunch", category: { name: "Food", type: "EXPENSE" } }
    ]);
    (getBudgets as jest.Mock).mockResolvedValue([{ amount: 500, category: { name: "Food" } }]);
  });

  it("renders detail and navigates to form", async () => {
    const { getByText } = render(<BudgetCategoryDetailScreen />);
    
    await waitFor(() => {
      expect(getByText("$100.00")).toBeTruthy();
      expect(getByText("$500.00")).toBeTruthy();
    });

    fireEvent.press(getByText("Set Budget"));
    expect(mockNavigate).toHaveBeenCalledWith("BudgetCategoryForm", { categoryId: "food" });
  });
});