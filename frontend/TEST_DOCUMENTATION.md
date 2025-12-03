# useExpenseSync Unit Tests

This document outlines the comprehensive unit tests for the `useExpenseSync` custom hook, which handles offline-first expense synchronization in the Expense Tracker Mobile App.

## Overview

The `useExpenseSync` hook is a critical component that manages:

- **Local storage** of expenses using AsyncStorage
- **Syncing** with remote server
- **Offline support** with automatic sync when online
- **Conflict resolution** between local and remote data
- **CRUD operations** (Create, Read, Update, Delete) on expenses

## Test Setup

### Configuration Files

#### `jest.config.js`

Jest configuration for running tests with proper module handling:

```javascript
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo)/)",
  ],
};
```

#### `.babelrc`

Babel configuration for transforming JSX and ES6 modules:

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

#### `jest.setup.js`

Minimal setup file for Jest configuration.

### Running the Tests

```bash
# Run all tests
npm test

# Run only useExpenseSync tests
npm test -- useExpenseSync.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Test Coverage

### 1. **LoadLocal - AsyncStorage Operations**

Tests JSON parsing and error handling for loading expenses from local storage.

- ✅ `should parse JSON string correctly when valid`
- ✅ `should handle null/undefined gracefully with try-catch`

**What it tests:**

- JSON serialization/deserialization
- Graceful fallback to empty array on error
- Handling of missing data

---

### 2. **SaveAndSet - Data Persistence**

Tests saving cleaned expense data to AsyncStorage.

- ✅ `should filter out null and undefined values`
- ✅ `should properly stringify data`
- ✅ `should handle empty arrays`

**What it tests:**

- Data cleanup before saving
- Proper JSON stringification
- Edge cases with empty datasets

---

### 3. **Merge - Conflict Resolution**

Tests the core merging logic for combining remote and local expenses.

- ✅ `should merge without duplicates`
- ✅ `should prioritize remote data for duplicate IDs`
- ✅ `should preserve local unsynced items`
- ✅ `should handle empty remote list`
- ✅ `should handle empty local list`
- ✅ `should handle both empty lists`

**What it tests:**

- Deduplication logic using Map
- Remote-first conflict resolution
- Preservation of unsynced local changes
- Edge cases with empty lists

---

### 4. **HandleAdd - Adding Expenses**

Tests the logic for creating new local expenses.

- ✅ `should create expense with local ID and unsynced flag`
- ✅ `should prepend new expense to list`

**What it tests:**

- Generation of unique local IDs (`local_<timestamp>_<random>`)
- Marking new items as `synced: false`
- Proper list ordering (newest first)

---

### 5. **HandleDelete - Deleting Expenses**

Tests deletion logic with different sync states.

- ✅ `should mark synced expense as deleted`
- ✅ `should completely remove unsynced expense`
- ✅ `should not remove if expense not found`

**What it tests:**

- Soft delete for synced items (marked with `deleted: true`)
- Hard delete for unsynced items (removed from list)
- Safe handling of missing items

---

### 6. **HandleEdit - Updating Expenses**

Tests editing logic while maintaining sync state.

- ✅ `should update expense and mark as unsynced`
- ✅ `should preserve original ID on edit`

**What it tests:**

- Updating expense properties
- Resetting `synced` flag on changes
- Maintaining expense ID across updates

---

### 7. **Sync Categorization**

Tests the logic for categorizing items during sync.

- ✅ `should categorize items for create (new, unsynced)`
- ✅ `should categorize items for delete (synced, marked deleted)`
- ✅ `should categorize items for update (synced=false, not deleted)`

**What it tests:**

- Filtering logic for sync operations
- Proper classification of expense states
- Identification of items needing server operations

---

### 8. **Network Status Handling**

Tests network state detection.

- ✅ `should determine online status from network state`
- ✅ `should handle offline state`
- ✅ `should handle mixed state (no internet but connected)`

**What it tests:**

- Network connectivity detection
- Proper boolean logic for online determination
- Edge cases like poor connectivity

---

### 9. **generateLocalId - Unique ID Generation**

Tests local ID generation for offline-created expenses.

- ✅ `should generate ID with local_ prefix`
- ✅ `should generate unique IDs`

**What it tests:**

- Proper ID format for offline-created items
- Uniqueness across multiple calls
- Format: `local_<timestamp>_<random>`

---

### 10. **Concurrent Sync Prevention**

Tests the sync lock mechanism to prevent race conditions.

- ✅ `should prevent multiple simultaneous syncs`

**What it tests:**

- `isSyncing` flag usage
- Prevention of concurrent operations
- Safe resource management

---

### 11. **Error Handling**

Tests error handling during sync operations.

- ✅ `should continue sync even if one item fails`
- ✅ `should use try-catch for error handling`

**What it tests:**

- Error isolation (one failure doesn't stop all syncs)
- Proper error catching and logging
- Graceful degradation

---

## Critical Functions Tested

### Core Sync Logic

```javascript
// Merge function - handles conflict resolution
const merge = (remote = [], local = []) => {
  const map = new Map();
  remote.forEach((item) => map.set(item._id, { ...item, synced: true }));
  local.forEach((item) => {
    if (!map.has(item._id)) {
      map.set(item._id, item);
    }
  });
  return Array.from(map.values());
};
```

### Sync Categorization

```javascript
// Determine what operations are needed
const toCreate = local.filter((item) => !item.synced && !item.deleted);
const toDelete = local.filter((item) => item.deleted && item.synced);
const toUpdate = local.filter((item) => item.synced === false && !item.deleted);
```

### Data Cleaning

```javascript
// Remove null/undefined before saving
const cleanList = newExpenseList.filter(Boolean);
```

---

## Test Execution Example

```bash
$ npm test -- useExpenseSync.test.js

 PASS  src/screens/__tests__/useExpenseSync.test.js
  useExpenseSync - Utility Functions
    loadLocal - Load expenses from AsyncStorage
      ✓ should parse JSON string correctly when valid
      ✓ should handle null/undefined gracefully with try-catch
    saveAndSet - Save expenses to AsyncStorage
      ✓ should filter out null and undefined values
      ✓ should properly stringify data
      ✓ should handle empty arrays
    ... (24 more tests)

Test Suites: 1 passed, 1 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        0.324 s
```

---

## Implementation Notes

### What the Tests Cover

1. **Data Integrity**: Ensures expenses are properly saved and loaded
2. **Sync Logic**: Tests conflict resolution between local and remote data
3. **Offline Support**: Validates local-first operations work correctly
4. **Network Handling**: Tests online/offline state detection
5. **Error Resilience**: Ensures one failure doesn't crash the sync
6. **ID Generation**: Validates unique ID creation for offline items

### What's NOT Covered (Integration Tests Needed)

These unit tests focus on business logic. Integration tests would cover:

- Actual AsyncStorage operations
- Network requests to backend
- Real React hook lifecycle
- Context provider integration
- UI updates during sync
- Multi-user scenarios

### Running Integration Tests

To test the full `useExpenseSync` hook with real async storage and network:

```javascript
// Example integration test (not in this suite)
describe("useExpenseSync Integration", () => {
  it("should sync expenses to server when online", async () => {
    // Requires: actual context providers, mocked API
    // Tests: full sync workflow
  });
});
```

---

## Maintenance

### Adding New Tests

1. Create test in `__tests__/useExpenseSync.test.js`
2. Follow the describe/it pattern
3. Use meaningful test names
4. Add comments for non-obvious logic

### Updating Tests

When modifying `useExpenseSync.js`:

1. Run tests to identify affected tests
2. Update test expectations
3. Ensure all tests pass before commit

### Debugging Failed Tests

```bash
# Run with verbose output
npm test -- useExpenseSync.test.js --verbose

# Run specific test
npm test -- useExpenseSync.test.js -t "should merge without duplicates"
```

---

## Summary

**Total Tests**: 29  
**Pass Rate**: 100%  
**Coverage**: Core sync, merge, CRUD operations, error handling  
**Execution Time**: ~0.3 seconds

The test suite ensures the critical offline-first sync logic works correctly before being integrated into the full React Native app.
