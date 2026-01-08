import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ReportScreen from "../ReportScreen";
import { getTransactions } from "../../services/transactions";
import { getBudgets } from "../../services/budgets";
import { getTokens } from "../../services/tokenStorage";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ 
    goBack: jest.fn(), 
    canGoBack: () => true 
  }),
  useFocusEffect: jest.fn(cb => cb()),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/budgets");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("ReportScreen", () => {
  beforeEach(() => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getTransactions as jest.Mock).mockResolvedValue([
      { amount: 5000, date: new Date().toISOString(), category: { name: "Rent", type: "EXPENSE" } },
      { amount: 200, date: new Date().toISOString(), category: { name: "Food", type: "EXPENSE" } }
    ]);
    (getBudgets as jest.Mock).mockResolvedValue([
      { amount: 4000, category: { name: "Rent" } },
      { amount: 300, category: { name: "Food" } }
    ]);
  });

  it("handles interactions with bars and category items", async () => {
    const { getByText, getAllByText } = render(<ReportScreen />);
    
    await waitFor(() => {
      expect(getByText("Over budget")).toBeTruthy();
      expect(getByText("Rent")).toBeTruthy();
    });

    const mBars = getAllByText("M");
    if (mBars.length) fireEvent.press(mBars[0]);

    fireEvent.press(getByText("Monthly"));
    await waitFor(() => {
      expect(getByText("W1")).toBeTruthy();
    });
  });

  it("renders correctly with no budget match", async () => {
    (getBudgets as jest.Mock).mockResolvedValue([]);
    const { getByText } = render(<ReportScreen />);
    await waitFor(() => {
      expect(getByText("Rent")).toBeTruthy();
    });
  });
});