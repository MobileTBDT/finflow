import React from "react";
import { render } from "@testing-library/react-native";
import ReportScreen from "../ReportScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/transactions");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    canGoBack: jest.fn(() => false),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

describe("ReportScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<ReportScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading state", () => {
    const { toJSON } = render(<ReportScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
