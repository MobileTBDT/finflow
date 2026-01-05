import "@testing-library/jest-native/extend-expect";

// RN Animated warning noise (avoid hard dependency on internal RN file)
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}), {
  virtual: true,
});
