import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditProfileScreen from "../EditProfileScreen";
import { getProfile, updateProfile } from "../../services/users";
import { getTokens } from "../../services/tokenStorage";
import { showSuccess } from "../../utils/toast";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack, replace: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../services/users");
jest.mock("../../services/tokenStorage");
jest.mock("../../utils/toast");

describe("EditProfileScreen", () => {
  beforeEach(() => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (getProfile as jest.Mock).mockResolvedValue({ fullname: "Old Name", phone: "123", email: "a@b.com", username: "u" });
  });

  it("updates profile", async () => {
    const { getByPlaceholderText, getByText } = render(<EditProfileScreen />);
    
    await waitFor(() => {
      expect(getByPlaceholderText("Enter full name").props.value).toBe("Old Name");
    });

    fireEvent.changeText(getByPlaceholderText("Enter full name"), "New Name");
    fireEvent.press(getByText("Save Changes"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ fullname: "New Name" }),
        "token"
      );
      expect(showSuccess).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});