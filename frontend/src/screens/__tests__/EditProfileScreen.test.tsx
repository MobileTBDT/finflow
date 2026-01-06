import React from "react";
import { render } from "@testing-library/react-native";
import EditProfileScreen from "../EditProfileScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/users");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("EditProfileScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<EditProfileScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows loading state", () => {
    const { toJSON } = render(<EditProfileScreen />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain("ActivityIndicator");
  });
});
