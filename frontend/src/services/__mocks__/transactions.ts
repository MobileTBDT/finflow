export const getTransactions = jest.fn(() => Promise.resolve([]));

export const createTransaction = jest.fn(() =>
  Promise.resolve({
    id: 1,
    amount: "100.00",
    date: "2024-01-01",
    note: "Test transaction",
    category: {
      id: 1,
      name: "Food",
      type: "EXPENSE",
      icon: "🍔",
    },
  })
);

export const getCategories = jest.fn(() =>
  Promise.resolve([
    { id: 1, name: "Food", type: "EXPENSE", icon: "🍔" },
    { id: 2, name: "Salary", type: "INCOME", icon: "💰" },
  ])
);
