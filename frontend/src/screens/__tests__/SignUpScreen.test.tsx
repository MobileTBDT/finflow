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

  it("handles registration with various input formats", async () => {
    (register as jest.Mock).mockResolvedValueOnce({
      access_token: "at",
      refresh_token: "rt",
    });

    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText("Lois"), "John");
    fireEvent.changeText(getByPlaceholderText("Becket"), "Doe");
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "  test.user@gmail.com  ");
    fireEvent.changeText(getByPlaceholderText("18/03/2024"), "15/05/1995");
    fireEvent.changeText(getByPlaceholderText("********"), "secret123");
    
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(expect.objectContaining({
        email: "test.user@gmail.com",
        fullname: "John Doe",
        dateofbirth: "1995-05-15",
      }));
      expect(showSuccess).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("MainTabs");
    });
  });

  it("normalizes date correctly for YYYY-MM-DD", async () => {
    (register as jest.Mock).mockResolvedValueOnce({ access_token: "a", refresh_token: "r" });
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "a@b.com");
    fireEvent.changeText(getByPlaceholderText("18/03/2024"), "1990-01-01");
    fireEvent.changeText(getByPlaceholderText("********"), "password123");
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(expect.objectContaining({
        dateofbirth: "1990-01-01",
      }));
    });
  });

  it("validates empty email", () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText("Register"));
    expect(showError).toHaveBeenCalledWith("Please enter email.");
  });

  it("validates short password", () => {
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("********"), "123");
    fireEvent.press(getByText("Register"));
    expect(showError).toHaveBeenCalledWith("Password must be at least 6 characters.");
  });

  it("switches to login tab", () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText("Log In"));
    expect(mockReplace).toHaveBeenCalledWith("Login");
  });

  it("toggles password visibility", () => {
    const { getByText } = render(<SignupScreen />);
    const toggle = getByText("👁");
    fireEvent.press(toggle);
    expect(getByText("🙈")).toBeTruthy();
    fireEvent.press(getByText("🙈"));
    expect(getByText("👁")).toBeTruthy();
  });
});