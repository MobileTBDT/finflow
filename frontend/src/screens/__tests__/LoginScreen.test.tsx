import React from "react";
import { render } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/auth");
jest.mock("../../services/tokenStorage");

describe("LoginScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<LoginScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
