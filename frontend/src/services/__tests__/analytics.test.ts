describe("services/analytics - logEvent", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("no-op on web", async () => {
    jest.resetModules();
    jest.doMock("react-native", () => ({ Platform: { OS: "web" } }));
    const { logEvent } = require("../analytics");
    await expect(
      logEvent("app_open_test", { source: "dev" })
    ).resolves.toBeUndefined();
  });

  it("calls firebase analytics on native", async () => {
    jest.resetModules();
    const logEventMock = jest.fn().mockResolvedValue(undefined);

    jest.doMock("react-native", () => ({ Platform: { OS: "android" } }));
    jest.doMock("@react-native-firebase/analytics", () => ({
      __esModule: true,
      default: () => ({ logEvent: logEventMock }),
    }));

    const { logEvent } = require("../analytics");
    await logEvent("app_open_test", { source: "dev" });
    expect(logEventMock).toHaveBeenCalledWith("app_open_test", {
      source: "dev",
    });
  });

  it("does not throw when analytics.logEvent rejects and logs a warning", async () => {
    jest.resetModules();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const rejectMock = jest.fn().mockRejectedValue(new Error("boom"));

    jest.doMock("react-native", () => ({ Platform: { OS: "android" } }));
    jest.doMock("@react-native-firebase/analytics", () => ({
      __esModule: true,
      default: () => ({ logEvent: rejectMock }),
    }));

    const { logEvent } = require("../analytics");
    await expect(logEvent("ev_err")).resolves.toBeUndefined();
    expect(rejectMock).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[analytics] failed to log event"),
      expect.any(Error)
    );
    warnSpy.mockRestore();
  });
});
