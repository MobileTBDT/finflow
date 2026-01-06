import { login, register } from "../auth";

global.fetch = jest.fn();

describe("auth service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("returns token on success", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            access_token: "token123",
            refresh_token: "refresh123",
            info: { id: 1, username: "test" },
          }),
      });

      const result = await login({ username: "user", password: "pass" });
      expect(result.access_token).toBe("token123");
    });

    it("throws error on failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: "Unauthorized" }),
      });

      await expect(
        login({ username: "user", password: "wrong" })
      ).rejects.toThrow();
    });
  });

  describe("register", () => {
    it("returns token on success", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            access_token: "token123",
            refresh_token: "refresh123",
            info: { id: 1 },
          }),
      });

      const result = await register({
        username: "test",
        email: "test@test.com",
        password: "pass",
        fullname: "Test",
        phone: "0123456789",
        image: "http://example.com/avatar.jpg",
      });

      expect(result.access_token).toBe("token123");
    });
  });
});
