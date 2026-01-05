import { BUDGET_CATEGORIES, getBudgetCategory } from "../budgetCategories";

describe("constants/budgetCategories", () => {
  it("has a non-empty category list", () => {
    expect(Array.isArray(BUDGET_CATEGORIES)).toBe(true);
    expect(BUDGET_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("contains expected ids (sanity)", () => {
    const ids = BUDGET_CATEGORIES.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(["food", "grocery"]));
  });

  it("each category has label and image defined (image mocked)", () => {
    for (const c of BUDGET_CATEGORIES) {
      expect(typeof c.label).toBe("string");
      // jest.fileMock returns "test-file-stub"
      expect(c.image).toBeDefined();
      expect(typeof c.image).toBe("string");
    }
  });

  it("getBudgetCategory returns a category for existing id", () => {
    const first = BUDGET_CATEGORIES[0];
    const found = getBudgetCategory(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it("getBudgetCategory returns undefined for unknown id", () => {
    expect(getBudgetCategory("__not_exist__")).toBeUndefined();
  });
});
