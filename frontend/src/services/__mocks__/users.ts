export const getProfile = jest.fn(() =>
  Promise.resolve({
    id: 1,
    username: "testuser",
    email: "test@example.com",
    fullname: "Test User",
    phone: "0123456789",
    dateofbirth: "1990-01-01",
    image: "https://example.com/avatar.jpg",
    createdAt: "2024-01-01T00:00:00.000Z",
  })
);

export const updateProfile = jest.fn(() =>
  Promise.resolve({
    id: 1,
    username: "testuser",
    email: "test@example.com",
    fullname: "Updated User",
  })
);

export const changePassword = jest.fn(() =>
  Promise.resolve({ message: "Password changed successfully" })
);
