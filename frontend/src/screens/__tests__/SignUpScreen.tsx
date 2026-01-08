import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignupScreen from "../SignupScreen";
import { register } from "../../services/auth";
import { showError, showSuccess } from "../../utils/toast";

const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/auth");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("SignupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("completes full registration flow with utilities", async () => {
    (register as jest.Mock).mockResolvedValueOnce({
      access_token: "at",
      refresh_token: "rt",
    });

    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Lois"), "Alice");
    fireEvent.changeText(getByPlaceholderText("Becket"), "Smith");
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "alice@test.com");
    fireEvent.changeText(getByPlaceholderText("18/03/2024"), "1995-05-20");
    fireEvent.changeText(getByPlaceholderText("********"), "password123");
    
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(expect.objectContaining({
        fullname: "Alice Smith",
        email: "alice@test.com",
        dateofbirth: "1995-05-20",
      }));
      expect(showSuccess).toHaveBeenCalled();
    });
  });

  it("validates date normalization", async () => {
    (register as jest.Mock).mockResolvedValueOnce({ access_token: "at" });
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "b@c.com");
    fireEvent.changeText(getByPlaceholderText("18/03/2024"), "25/12/1990");
    fireEvent.changeText(getByPlaceholderText("********"), "password123");
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(expect.objectContaining({
        dateofbirth: "1990-12-25",
      }));
    });
  });

  it("handles registration error", async () => {
    (register as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "err@test.com");
    fireEvent.changeText(getByPlaceholderText("********"), "password123");
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith("Network Error");
    });
  });

  it("shows error for empty email", () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText("Register"));
    expect(showError).toHaveBeenCalledWith("Please enter email.");
  });

  it("navigates to login tab", () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText("Log In"));
    expect(mockReplace).toHaveBeenCalledWith("Login");
  });
});