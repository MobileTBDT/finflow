import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { login } from "../../services/auth";
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

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles form input and successful login", async () => {
    (login as jest.Mock).mockResolvedValueOnce({
      access_token: "at",
      refresh_token: "rt",
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText("you@email.com"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("********"), "password123");
    
    const loginBtn = getByText("Log In");
    fireEvent.press(loginBtn);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        username: "test@test.com",
        password: "password123",
      });
      expect(showSuccess).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("MainTabs");
    });
  });

  it("shows error if fields are empty", async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Log In"));
    expect(showError).toHaveBeenCalledWith("Please enter email.");
  });

  it("toggles password visibility", () => {
    const { getByText } = render(<LoginScreen />);
    const toggle = getByText("👁");
    fireEvent.press(toggle);
    expect(getByText("🙈")).toBeTruthy();
  });

  it("navigates to signup tab", () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Sign Up"));
    expect(mockReplace).toHaveBeenCalledWith("SignUp");
  });
});