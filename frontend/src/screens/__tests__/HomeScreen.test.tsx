import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../HomeScreen";

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

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn((callback) => {
    // Không gọi callback
  }),
}));

describe("HomeScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading indicator", () => {
    const { toJSON } = render(<HomeScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
