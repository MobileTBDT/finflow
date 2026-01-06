export const getBudgets = jest.fn(() => Promise.resolve([]));

export const createOrUpdateBudget = jest.fn(() =>
  Promise.resolve({
    id: 1,
    amount: "500.00",
    month: "2024-01",
    category: {
      id: 1,
      name: "Food",
      type: "EXPENSE",
      icon: "🍔",
    },
  })
);

export const deleteBudget = jest.fn(() => Promise.resolve());
