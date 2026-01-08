import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BudgetScreen from "../BudgetScreen";
import { getTransactions } from "../../services/transactions";
import { getBudgets, createOrUpdateBudget } from "../../services/budgets";
import { getTokens } from "../../services/tokenStorage";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: jest.fn() }),
  useFocusEffect: jest.fn(cb => cb()),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/budgets");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("BudgetScreen", () => {
  beforeEach(() => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getTransactions as jest.Mock).mockResolvedValue([]);
    (getBudgets as jest.Mock).mockResolvedValue([{ id: 1, amount: 500, categoryId: 10, category: { name: "Food & Dining" } }]);
  });

  it("loads data and handles edit budget", async () => {
    const { getByText, getByPlaceholderText } = render(<BudgetScreen />);
    
    await waitFor(() => {
      expect(getByText("$500.00")).toBeTruthy();
    });

    fireEvent.press(getByText("Edit Budget"));
    const input = getByPlaceholderText("Amount...");
    fireEvent.changeText(input, "1000");
    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(createOrUpdateBudget).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1000 }),
        "token"
      );
    });
  });

  it("navigates to detail", async () => {
    const { getByText } = render(<BudgetScreen />);
    await waitFor(() => {
      fireEvent.press(getByText("Food"));
    });
    expect(mockNavigate).toHaveBeenCalledWith("BudgetCategoryDetail", expect.anything());
  });
});