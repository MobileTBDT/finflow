import {
  getTransactions,
  createTransaction,
  getCategories,
} from "../transactions";

global.fetch = jest.fn();

describe("transactions service", () => {
  const mockToken = "mock-token";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTransactions", () => {
    it("returns transactions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify([{ id: 1, amount: 100 }]),
      });

      const result = await getTransactions(mockToken);
      expect(result).toEqual([{ id: 1, amount: 100 }]);
    });
  });

  describe("createTransaction", () => {
    it("creates transaction", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ id: 1 }),
      });

      const result = await createTransaction(
        {
          amount: 100,
          categoryId: 1,
          date: "2024-01-01",
        },
        mockToken
      );

      expect(result.id).toBe(1);
    });
  });

  describe("getCategories", () => {
    it("returns categories", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify([{ id: 1, name: "Food" }]),
      });

      const result = await getCategories(mockToken);
      expect(result).toEqual([{ id: 1, name: "Food" }]);
    });
  });
});
