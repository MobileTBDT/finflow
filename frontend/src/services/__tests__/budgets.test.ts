import { getBudgets, createOrUpdateBudget, deleteBudget } from "../budgets";

global.fetch = jest.fn();

describe("budgets service", () => {
  const mockToken = "mock-token";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBudgets", () => {
    it("returns budgets", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify([{ id: 1, amount: 500 }]),
      });

      const result = await getBudgets(mockToken);
      expect(result).toEqual([{ id: 1, amount: 500 }]);
    });
  });

  describe("createOrUpdateBudget", () => {
    it("creates budget", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ id: 1 }),
      });

      const result = await createOrUpdateBudget(
        {
          categoryId: 1,
          amount: 500,
          month: "2024-01",
        },
        mockToken
      );

      expect(result.id).toBe(1);
    });
  });

  describe("deleteBudget", () => {
    it("deletes budget", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteBudget(1, mockToken);
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
