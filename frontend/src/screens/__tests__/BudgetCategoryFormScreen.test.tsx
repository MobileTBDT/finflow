import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BudgetCategoryFormScreen from "../BudgetCategoryFormScreen";
import { getCategories } from "../../services/transactions";
import { createOrUpdateBudget } from "../../services/budgets";
import { getTokens } from "../../services/tokenStorage";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack, replace: jest.fn() }),
  useRoute: () => ({ params: { categoryId: "food" } }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/budgets");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("BudgetCategoryFormScreen", () => {
  beforeEach(() => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getCategories as jest.Mock).mockResolvedValue([{ id: 10, name: "Food", type: "EXPENSE" }]);
  });

  it("saves budget", async () => {
    const { getByPlaceholderText, getByText } = render(<BudgetCategoryFormScreen />);
    
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText("Enter amount..."), "300");
    fireEvent.press(getByText("Save Budget"));

    await waitFor(() => {
      expect(createOrUpdateBudget).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 300, categoryId: 10 }),
        "token"
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});