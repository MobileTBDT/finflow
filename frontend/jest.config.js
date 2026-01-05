module.exports = {
  preset: "jest-expo",
  testMatch: [
    "**/__tests__/**/*.test.(ts|tsx|js)",
    "**/src/tests/**/*.test.(ts|tsx|js)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  collectCoverage: true,
  collectCoverageFrom: [
    "src/services/**/*.{ts,tsx}",
    "src/constants/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
  ],

  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "<rootDir>/coverage",

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/jest.fileMock.js",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|react-native-svg|@react-navigation/.*)",
  ],
};
