describe("services/analytics - logEvent", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("Platform: Web", () => {
    beforeEach(() => {
      jest.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    });

    it("should not throw error on web environment", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("test_event")).resolves.not.toThrow();
    });

    it("should resolve to undefined on web", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("test_event")).resolves.toBeUndefined();
    });

    it("should accept event parameters on web without error", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("test_event", { id: 1 })).resolves.toBeUndefined();
    });

    it("should accept empty parameters on web", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("test_event", {})).resolves.toBeUndefined();
    });
  });

  describe("Platform: Android", () => {
    let logEventMock: jest.Mock;

    beforeEach(() => {
      logEventMock = jest.fn().mockResolvedValue(undefined);
      jest.doMock("react-native", () => ({ Platform: { OS: "android" } }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: logEventMock }),
      }));
    });

    it("should initialize module without error on Android", () => {
      expect(() => require("../analytics")).not.toThrow();
    });

    it("should call firebase logEvent on Android", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("test_event");
      expect(logEventMock).toHaveBeenCalled();
    });

    it("should call firebase logEvent exactly once on Android", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("test_event");
      expect(logEventMock).toHaveBeenCalledTimes(1);
    });

    it("should pass the correct event name to firebase on Android", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("click_button");
      expect(logEventMock).toHaveBeenCalledWith("click_button", undefined);
    });

    it("should pass the correct parameters to firebase on Android", async () => {
      const { logEvent } = require("../analytics");
      const params = { user_id: 123, source: "home" };
      await logEvent("view_item", params);
      expect(logEventMock).toHaveBeenCalledWith("view_item", params);
    });

    it("should handle empty object parameters on Android", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("view_item", {});
      expect(logEventMock).toHaveBeenCalledWith("view_item", {});
    });

    it("should handle complex nested parameters on Android", async () => {
      const { logEvent } = require("../analytics");
      const params = { meta: { version: 1, active: true } };
      await logEvent("complex_event", params);
      expect(logEventMock).toHaveBeenCalledWith("complex_event", params);
    });
  });

  describe("Platform: iOS", () => {
    let logEventMock: jest.Mock;

    beforeEach(() => {
      logEventMock = jest.fn().mockResolvedValue(undefined);
      jest.doMock("react-native", () => ({ Platform: { OS: "ios" } }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: logEventMock }),
      }));
    });

    it("should initialize module without error on iOS", () => {
      expect(() => require("../analytics")).not.toThrow();
    });

    it("should call firebase logEvent on iOS", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("test_event_ios");
      expect(logEventMock).toHaveBeenCalled();
    });

    it("should call firebase logEvent exactly once on iOS", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("test_event_ios");
      expect(logEventMock).toHaveBeenCalledTimes(1);
    });

    it("should pass the correct event name to firebase on iOS", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("swipe_left");
      expect(logEventMock).toHaveBeenCalledWith("swipe_left", undefined);
    });

    it("should pass the correct parameters to firebase on iOS", async () => {
      const { logEvent } = require("../analytics");
      const params = { screen: "settings" };
      await logEvent("screen_view", params);
      expect(logEventMock).toHaveBeenCalledWith("screen_view", params);
    });
  });

  describe("Error Handling (Android)", () => {
    let rejectMock: jest.Mock;

    beforeEach(() => {
      rejectMock = jest.fn().mockRejectedValue(new Error("Firebase Error"));
      jest.doMock("react-native", () => ({ Platform: { OS: "android" } }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: rejectMock }),
      }));
    });

    it("should attempt to call firebase even if it fails", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("fail_event");
      expect(rejectMock).toHaveBeenCalled();
    });

    it("should not throw an exception up the stack when firebase fails", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("fail_event")).resolves.not.toThrow();
    });

    it("should resolve to undefined when firebase fails", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("fail_event")).resolves.toBeUndefined();
    });

    it("should log a warning to console when firebase fails", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("fail_event");
      expect(warnSpy).toHaveBeenCalled();
    });

    it("should log the specific error message to console", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("fail_event");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[analytics] failed to log event"),
        expect.any(Error)
      );
    });
  });

  describe("Error Handling (iOS)", () => {
    let rejectMock: jest.Mock;

    beforeEach(() => {
      rejectMock = jest.fn().mockRejectedValue(new Error("iOS Unknown Error"));
      jest.doMock("react-native", () => ({ Platform: { OS: "ios" } }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: rejectMock }),
      }));
    });

    it("should not throw an exception on iOS failure", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("ios_fail")).resolves.not.toThrow();
    });

    it("should log a warning to console on iOS failure", async () => {
      const { logEvent } = require("../analytics");
      await logEvent("ios_fail");
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe("Additional Event Tests (Web)", () => {
    beforeEach(() => {
      jest.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    });

    it("should handle event 'app_open'", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("app_open")).resolves.toBeUndefined();
    });

    it("should handle event 'button_click'", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("button_click")).resolves.toBeUndefined();
    });

    it("should handle event 'screen_view'", async () => {
      const { logEvent } = require("../analytics");
      await expect(logEvent("screen_view")).resolves.toBeUndefined();
    });

    it("should handle 'app_open' with params", async () => {
      const { logEvent } = require("../analytics");
      await expect(
        logEvent("app_open", { version: "1.0" })
      ).resolves.toBeUndefined();
    });

    it("should handle 'button_click' with params", async () => {
      const { logEvent } = require("../analytics");
      await expect(
        logEvent("button_click", { button: "save" })
      ).resolves.toBeUndefined();
    });

    [
      "purchase",
      "login",
      "logout",
      "search",
      "share",
      "favorite",
      "delete",
      "update",
    ].forEach((event) => {
      it(`should handle '${event}' event on web`, async () => {
        const { logEvent } = require("../analytics");
        await expect(logEvent(event, { id: 1 })).resolves.toBeUndefined();
      });
    });
  });

  describe("Additional Event Tests (Android)", () => {
    let logEventMock: jest.Mock;

    beforeEach(() => {
      logEventMock = jest.fn().mockResolvedValue(undefined);
      jest.doMock("react-native", () => ({ Platform: { OS: "android" } }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: logEventMock }),
      }));
    });

    [
      "app_open",
      "button_click",
      "screen_view",
      "purchase",
      "login",
      "logout",
      "search",
      "share",
      "favorite",
      "delete",
      "update",
      "scroll",
      "zoom",
      "swipe",
      "tap",
      "long_press",
      "double_tap",
      "drag",
      "drop",
      "pinch",
    ].forEach((event) => {
      it(`should call firebase for '${event}' on Android`, async () => {
        const { logEvent } = require("../analytics");
        await logEvent(event, { param: "test" });
        expect(logEventMock).toHaveBeenCalledWith(event, { param: "test" });
      });
    });
  });

  describe("Additional Event Tests (iOS)", () => {
    let logEventMock: jest.Mock;

    beforeEach(() => {
      logEventMock = jest.fn().mockResolvedValue(undefined);
      jest.doMock("react-native", () => ({ Platform: { OS: "ios" } }));
      jest.doMock("@react-native-firebase/analytics", () => ({
        __esModule: true,
        default: () => ({ logEvent: logEventMock }),
      }));
    });

    ["app_open", "button_click", "screen_view", "purchase", "login"].forEach(
      (event) => {
        it(`should call firebase for '${event}' on iOS`, async () => {
          const { logEvent } = require("../analytics");
          await logEvent(event);
          expect(logEventMock).toHaveBeenCalledWith(event, undefined);
        });
      }
    );
  });

  describe("Additional Error Handling", () => {
    ["android", "ios"].forEach((platform) => {
      describe(`Error on ${platform}`, () => {
        let rejectMock: jest.Mock;

        beforeEach(() => {
          rejectMock = jest.fn().mockRejectedValue(new Error("Test Error"));
          jest.doMock("react-native", () => ({ Platform: { OS: platform } }));
          jest.doMock("@react-native-firebase/analytics", () => ({
            __esModule: true,
            default: () => ({ logEvent: rejectMock }),
          }));
        });

        it(`should not throw on ${platform} error`, async () => {
          const { logEvent } = require("../analytics");
          await expect(logEvent("error_event")).resolves.not.toThrow();
        });
      });
    });
  });


});