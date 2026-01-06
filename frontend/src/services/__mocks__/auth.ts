export const register = jest.fn(() =>
  Promise.resolve({
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    info: {
      id: 1,
      username: "testuser",
      email: "test@example.com",
    },
  })
);

export const login = jest.fn(() =>
  Promise.resolve({
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    info: {
      id: 1,
      username: "testuser",
      email: "test@example.com",
    },
  })
);
