import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OnboardingScreen from "../OnboardingScreen";
const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => ({
useNavigation: () => ({
replace: mockReplace,
}),
}));
jest.mock("react-native-safe-area-context", () => ({
SafeAreaView: ({ children }: any) => children,
}));
describe("OnboardingScreen", () => {
beforeEach(() => {
jest.clearAllMocks();
});
it("renders correctly and navigates to Login on press", () => {
const { getByText } = render(<OnboardingScreen />);
expect(getByText("Welcome to FINFLOW")).toBeTruthy();
const btn = getByText("Let’s Get Started");
fireEvent.press(btn);
expect(mockReplace).toHaveBeenCalledWith("Login");
});
});