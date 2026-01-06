export const getTokens = jest.fn(() =>
  Promise.resolve({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  })
);

export const setTokens = jest.fn(() => Promise.resolve());

export const clearTokens = jest.fn(() => Promise.resolve());
