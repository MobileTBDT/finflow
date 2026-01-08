import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfileScreen from "../ProfileScreen";
import { getProfile } from "../../services/users";
import { getTransactions } from "../../services/transactions";
import { getTokens } from "../../services/tokenStorage";
import { showSuccess } from "../../utils/toast";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ 
    navigate: mockNavigate, 
    reset: jest.fn(), 
    replace: jest.fn() 
  }),
  useFocusEffect: jest.fn(cb => cb()),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/users");
jest.mock("../../services/transactions");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("ProfileScreen", () => {
  beforeEach(() => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getProfile as jest.Mock).mockResolvedValue({ 
      fullname: "John Smith", 
      email: "john@smith.com", 
      username: "jsmith",
      image: null 
    });
    (getTransactions as jest.Mock).mockResolvedValue([
      { amount: 1000, category: { type: "INCOME" } },
      { amount: 400, category: { type: "EXPENSE" } }
    ]);
  });

  it("navigates to edit profile from user card and button", async () => {
    const { getByText, getAllByRole } = render(<ProfileScreen />);
    
    await waitFor(() => {
      expect(getByText("John Smith")).toBeTruthy();
    });

    fireEvent.press(getByText("Edit Profile"));
    expect(mockNavigate).toHaveBeenCalledWith("EditProfile");

    fireEvent.press(getByText("Account"));
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it("shows common settings alerts", async () => {
    const { getByText } = render(<ProfileScreen />);
    await waitFor(() => {
      fireEvent.press(getByText("Currency"));
      expect(showSuccess).toHaveBeenCalledWith("Coming soon!");
      
      fireEvent.press(getByText("About"));
      expect(showSuccess).toHaveBeenCalledWith("FinFlow v1.0.0");
    });
  });

  it("handles notification modal", async () => {
    const { getByText, queryByText } = render(<ProfileScreen />);
    await waitFor(() => {
      fireEvent.press(getByText("Notifications"));
    });
    expect(getByText("No Notifications")).toBeTruthy();
    fireEvent.press(getByText("Got it"));
    await waitFor(() => {
      expect(queryByText("Got it")).toBeNull();
    });
  });
});