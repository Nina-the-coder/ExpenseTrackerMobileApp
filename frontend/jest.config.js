module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.js"],
  moduleNameMapper: {
    "^@react-native-async-storage/async-storage$": "<rootDir>/jest.setup.js",
    "^@react-native-community/netinfo$": "<rootDir>/jest.setup.js",
    "^react-native$": "<rootDir>/jest.setup.js",
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo)/)",
  ],
};
