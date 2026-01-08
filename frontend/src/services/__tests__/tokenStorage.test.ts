import { Platform } from "react-native";

const mockAsyncStorage = {
  multiSet: jest.fn(),
  multiGet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: mockAsyncStorage,
}));

describe("tokenStorage service", () => {
  const tokens = { accessToken: "at", refreshToken: "rt" };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe("Web Platform", () => {
    beforeAll(() => {
      Platform.OS = "web";
    });

    it("saveTokens uses localStorage", async () => {
      const { saveTokens } = require("../tokenStorage");
      await saveTokens(tokens);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "finflow.access_token",
        "at"
      );
    });

    it("getTokens returns null if not found", async () => {
      const { getTokens } = require("../tokenStorage");
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      const res = await getTokens();
      expect(res).toBeNull();
    });

    it("getTokens returns tokens if present", async () => {
      const { getTokens } = require("../tokenStorage");
      (window.localStorage.getItem as jest.Mock).mockReturnValue("val");
      const res = await getTokens();
      expect(res).toEqual({ accessToken: "val", refreshToken: "val" });
    });

    it("clearTokens uses localStorage", async () => {
      const { clearTokens } = require("../tokenStorage");
      await clearTokens();
      expect(window.localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe("Native Platform", () => {
    beforeAll(() => {
      Platform.OS = "ios";
    });

    it("saveTokens uses AsyncStorage", async () => {
      const { saveTokens } = require("../tokenStorage");
      await saveTokens(tokens);
      expect(mockAsyncStorage.multiSet).toHaveBeenCalled();
    });

    it("getTokens returns null if incomplete", async () => {
      const { getTokens } = require("../tokenStorage");
      mockAsyncStorage.multiGet.mockResolvedValue([
        ["k1", "at"],
        ["k2", null],
      ]);
      const res = await getTokens();
      expect(res).toBeNull();
    });

    it("getTokens returns data if complete", async () => {
      const { getTokens } = require("../tokenStorage");
      mockAsyncStorage.multiGet.mockResolvedValue([
        ["k1", "at"],
        ["k2", "rt"],
      ]);
      const res = await getTokens();
      expect(res).toEqual(tokens);
    });

    it("clearTokens uses AsyncStorage", async () => {
      const { clearTokens } = require("../tokenStorage");
      await clearTokens();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });
});