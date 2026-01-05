import { BUDGET_CATEGORIES, getBudgetCategory } from "../budgetCategories";

describe("constants/budgetCategories", () => {
  it("should define BUDGET_CATEGORIES", () => {
    expect(BUDGET_CATEGORIES).toBeDefined();
  });

  it("should be an array", () => {
    expect(Array.isArray(BUDGET_CATEGORIES)).toBe(true);
  });

  it("should not be empty", () => {
    expect(BUDGET_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("should match the snapshot", () => {
    expect(BUDGET_CATEGORIES).toMatchSnapshot();
  });

  it("should ensure every category has an id property", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty("id");
    });
  });

  it("should ensure every id is a string", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(typeof category.id).toBe("string");
    });
  });

  it("should ensure every id is not an empty string", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category.id.length).toBeGreaterThan(0);
    });
  });

  it("should ensure every id is lowercase and kebab-case or snake-case compatible", () => {
    const regex = /^[a-z0-9-_]+$/;
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category.id).toMatch(regex);
    });
  });

  it("should ensure every category has a label property", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty("label");
    });
  });

  it("should ensure every label is a string", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(typeof category.label).toBe("string");
    });
  });

  it("should ensure every label is not empty", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category.label.length).toBeGreaterThan(0);
    });
  });

  it("should ensure every label is trimmed", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category.label).toBe(category.label.trim());
    });
  });

  it("should ensure every category has an image property", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty("image");
    });
  });

  it("should ensure every image is a string", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(typeof category.image).toBe("string");
    });
  });

  it("should ensure every image path is not empty", () => {
    BUDGET_CATEGORIES.forEach((category) => {
      expect(category.image.length).toBeGreaterThan(0);
    });
  });

  it("should have unique ids across all categories", () => {
    const ids = BUDGET_CATEGORIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique labels across all categories", () => {
    const labels = BUDGET_CATEGORIES.map((c) => c.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });

  it("should contain the 'food' category", () => {
    const ids = BUDGET_CATEGORIES.map((c) => c.id);
    expect(ids).toContain("food");
  });

  it("should contain the 'grocery' category", () => {
    const ids = BUDGET_CATEGORIES.map((c) => c.id);
    expect(ids).toContain("grocery");
  });

  it("should contain the 'transport' category", () => {
    const ids = BUDGET_CATEGORIES.map((c) => c.id);
    expect(ids).toContain("transport");
  });

  describe("getBudgetCategory function", () => {
    it("should be a function", () => {
      expect(typeof getBudgetCategory).toBe("function");
    });

    it("should return the correct object for the first category in the list", () => {
      const firstCategory = BUDGET_CATEGORIES[0];
      const result = getBudgetCategory(firstCategory.id);
      expect(result).toEqual(firstCategory);
    });

    it("should return the correct object for the last category in the list", () => {
      const lastCategory = BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1];
      const result = getBudgetCategory(lastCategory.id);
      expect(result).toEqual(lastCategory);
    });

    it("should return the 'food' category object when requested", () => {
      const result = getBudgetCategory("food");
      expect(result).toBeDefined();
      expect(result?.id).toBe("food");
    });

    it("should return undefined for a non-existent id", () => {
      const result = getBudgetCategory("non-existent-id-12345");
      expect(result).toBeUndefined();
    });

    it("should return undefined for an empty string id", () => {
      const result = getBudgetCategory("");
      expect(result).toBeUndefined();
    });

    it("should return undefined for a string with only spaces", () => {
      const result = getBudgetCategory("   ");
      expect(result).toBeUndefined();
    });

    it("should return undefined for an id with wrong casing if logic is case-sensitive", () => {
      const result = getBudgetCategory("FOOD");
      if (BUDGET_CATEGORIES.some(c => c.id === "food")) {
         expect(result).toBeUndefined();
      }
    });

    it("should return undefined for null inputs if type checking is bypassed", () => {
      const result = getBudgetCategory(null as any);
      expect(result).toBeUndefined();
    });

    it("should return undefined for undefined inputs if type checking is bypassed", () => {
      const result = getBudgetCategory(undefined as any);
      expect(result).toBeUndefined();
    });
  });
});