describe("tokenStorage", () => {
  it("exports getTokens function", () => {
    const tokenStorage = require("../tokenStorage");
    expect(typeof tokenStorage.getTokens).toBe("function");
  });

  it("exports saveTokens function", () => {
    const tokenStorage = require("../tokenStorage");
    expect(typeof tokenStorage.saveTokens).toBe("function");
  });

  it("exports clearTokens function", () => {
    const tokenStorage = require("../tokenStorage");
    expect(typeof tokenStorage.clearTokens).toBe("function");
  });
});
