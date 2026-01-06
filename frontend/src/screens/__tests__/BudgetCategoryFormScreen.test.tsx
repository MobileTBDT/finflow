import React from "react";
import { render } from "@testing-library/react-native";
import BudgetCategoryFormScreen from "../BudgetCategoryFormScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { categoryId: "food" },
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/budgets");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("BudgetCategoryFormScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<BudgetCategoryFormScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading indicator initially", () => {
    const { toJSON } = render(<BudgetCategoryFormScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
