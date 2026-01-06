import React from "react";
import { render } from "@testing-library/react-native";
import ProfileScreen from "../ProfileScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => {
    // Không gọi callback để tránh async
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/users");
jest.mock("../../services/transactions");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("ProfileScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<ProfileScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading state", () => {
    const { toJSON } = render(<ProfileScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
