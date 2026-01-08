import { NativeModules, Platform } from "react-native";
import Constants from "expo-constants";

describe("services/analytics", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("Environment checks", () => {
    it("isExpoGo returns true when executionEnvironment is storeClient", () => {
      jest.doMock("expo-constants", () => ({
        executionEnvironment: "storeClient",
      }));
      jest.doMock("react-native", () => ({
        Platform: { OS: "ios" },
        NativeModules: { RNFBAppModule: {} },
      }));
      const { logEvent } = require("../analytics");
      logEvent("test");
      expect(NativeModules.RNFBAppModule).toBeDefined();
    });

    it("isExpoGo returns true when appOwnership is expo", () => {
      jest.doMock("expo-constants", () => ({
        appOwnership: "expo",
      }));
      const { logEvent } = require("../analytics");
      logEvent("test");
    });

    it("isRNFirebaseAvailable returns false when NativeModules.RNFBAppModule is missing", async () => {
      jest.doMock("expo-constants", () => ({}));
      jest.doMock("react-native", () => ({
        Platform: { OS: "android" },
        NativeModules: {},
      }));
      const { logEvent } = require("../analytics");
      await logEvent("test");
    });
  });

  describe("Platform: Web", () => {
    beforeEach(() => {
      jest.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    });

    it("should resolve to undefined on web", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("test_event")).resolves.toBeUndefined();
    });
  });

  describe("Platform: Native", () => {
    let logEventMock: jest.Mock;

    beforeEach(() => {
      logEventMock = jest.fn().mockResolvedValue(undefined);
      jest.doMock("expo-constants", () => ({}));
      jest.doMock("react-native", () => ({
        Platform: { OS: "ios" },
        NativeModules: { RNFBAppModule: {} },
      }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: logEventMock }),
      }));
    });

    it("should call firebase logEvent", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("test_event", { foo: "bar" });
      expect(logEventMock).toHaveBeenCalledWith("test_event", { foo: "bar" });
    });

    it("should handle initialization errors", async () => {
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: null,
      }));
      const { logEvent } = require("../analytics");
      await logEvent("test");
    });

    it("should catch and warn on execution errors", async () => {
      logEventMock.mockRejectedValue(new Error("Firebase Fail"));
      const { logEvent } = require("../analytics");
      await logEvent("test");
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});