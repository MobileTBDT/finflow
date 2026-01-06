import { getProfile, updateProfile, changePassword } from "../users";

global.fetch = jest.fn();

describe("users service", () => {
  const mockToken = "mock-token";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("returns user profile", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ id: 1, username: "test" }),
      });

      const result = await getProfile(mockToken);
      expect(result.username).toBe("test");
    });
  });

  describe("updateProfile", () => {
    it("updates profile", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ id: 1, fullname: "Updated" }),
      });

      const result = await updateProfile({ fullname: "Updated" }, mockToken);
      expect(result.fullname).toBe("Updated");
    });
  });

  describe("changePassword", () => {
    it("changes password", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ message: "Success" }),
      });

      const result = await changePassword(
        {
          currentPassword: "old",
          newPassword: "new",
        },
        mockToken
      );

      expect(result.message).toBe("Success");
    });
  });
});
