import React from "react";
import { render } from "@testing-library/react-native";
import BudgetScreen from "../BudgetScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => {
    // Không gọi callback
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions", () => ({
  getTransactions: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../services/budgets", () => ({
  getBudgets: jest.fn(() => Promise.resolve([])),
}));

jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("BudgetScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<BudgetScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading state", () => {
    const { toJSON } = render(<BudgetScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
