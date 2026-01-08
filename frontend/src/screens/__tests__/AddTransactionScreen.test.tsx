import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddTransactionScreen from "../AddTransactionScreen";
import { getCategories, createTransaction } from "../../services/transactions";
import { getTokens } from "../../services/tokenStorage";
import { showSuccess } from "../../utils/toast";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

const mockCats = [
  { id: 1, name: "Food & Dining", type: "EXPENSE" },
  { id: 2, name: "Salary", type: "INCOME" },
];

describe("AddTransactionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getCategories as jest.Mock).mockResolvedValue(mockCats);
  });

  it("handles keypad input and saves expense", async () => {
    const { getByText, getAllByText } = render(<AddTransactionScreen />);
    
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    fireEvent.press(getByText("1"));
    fireEvent.press(getByText("0"));
    fireEvent.press(getByText("0"));

    expect(getByText("100đ")).toBeTruthy();

    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100, categoryId: 1 }),
        "token"
      );
      expect(showSuccess).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("toggles panels", async () => {
    const { getByText, getByPlaceholderText } = render(<AddTransactionScreen />);
    await waitFor(() => {
        fireEvent.press(getByText("Note..."));
    });
    expect(getByPlaceholderText("Type something...")).toBeTruthy();
    
    fireEvent.press(getByText("Mo")); 
  });

  it("switches to income type", async () => {
    const { getByText } = render(<AddTransactionScreen />);
    await waitFor(() => {
        fireEvent.press(getByText("Income"));
    });
    fireEvent.press(getByText("1"));
    fireEvent.press(getByText("Save"));
    
    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1, categoryId: 2 }),
        "token"
      );
    });
  });
});