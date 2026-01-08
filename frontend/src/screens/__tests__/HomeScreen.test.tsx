import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../HomeScreen";
import { getTransactions } from "../../services/transactions";
import { getTokens } from "../../services/tokenStorage";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ replace: jest.fn() }),
  useFocusEffect: jest.fn(cb => cb()),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders transactions and filtering logic", async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "at" });
    (getTransactions as jest.Mock).mockResolvedValue([
      { id: 1, amount: 500, date: new Date().toISOString(), category: { name: "Salary", type: "INCOME" } },
      { id: 2, amount: 200, date: new Date().toISOString(), category: { name: "Food & Dining", type: "EXPENSE" } },
      { id: 3, amount: 150, date: new Date().toISOString(), category: { name: "Transportation", type: "EXPENSE" } },
    ]);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("$500.00")).toBeTruthy();
      expect(getByText("$350.00")).toBeTruthy();
      expect(getByText("Food & Dining")).toBeTruthy();
    });
  });

  it("renders empty state correctly", async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "at" });
    (getTransactions as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("No expenses this month")).toBeTruthy();
      expect(getByText("$0.00")).toBeTruthy();
    });
  });

  it("handles pull to refresh", async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "at" });
    (getTransactions as jest.Mock).mockResolvedValue([]);
    const { getByTestId, findByType } = render(<HomeScreen />);
    
    await waitFor(() => {
      const scroll = findByType(require('react-native').ScrollView);
      scroll.props.refreshControl.props.onRefresh();
      expect(getTransactions).toHaveBeenCalledTimes(2);
    });
  });
});