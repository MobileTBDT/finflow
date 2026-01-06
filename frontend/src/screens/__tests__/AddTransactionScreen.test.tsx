import React from "react";
import { render } from "@testing-library/react-native";
import AddTransactionScreen from "../AddTransactionScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions", () => ({
  getCategories: jest.fn(() => Promise.resolve([])),
  createTransaction: jest.fn(() => Promise.resolve({ id: 1 })),
}));

jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("AddTransactionScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<AddTransactionScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows component structure", () => {
    const { toJSON } = render(<AddTransactionScreen />);
    const json = JSON.stringify(toJSON());
    expect(json.length).toBeGreaterThan(0);
  });
});
