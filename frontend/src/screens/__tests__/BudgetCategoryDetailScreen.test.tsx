import React from "react";
import { render } from "@testing-library/react-native";
import BudgetCategoryDetailScreen from "../BudgetCategoryDetailScreen";

jest.mock("../../services/transactions");
jest.mock("../../services/budgets");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      categoryId: "food",
      categoryMeta: { label: "Food", image: "mock" },
    },
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("BudgetCategoryDetailScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<BudgetCategoryDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading indicator", () => {
    const { toJSON } = render(<BudgetCategoryDetailScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
