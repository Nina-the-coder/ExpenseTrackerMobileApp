# Unit Testing Setup - Quick Start Guide

## Files Created

### 1. **jest.config.js** (Root of frontend/)

Configuration for Jest test runner with proper Node environment and Babel transformation.

### 2. **.babelrc** (Root of frontend/)

Babel configuration to support ES6 modules and JSX in tests using `@babel/preset-env` and `@babel/preset-react`.

### 3. **jest.setup.js** (Root of frontend/)

Jest setup file for test environment initialization.

### 4. **src/screens/**tests**/useExpenseSync.test.js**

Comprehensive unit test suite with 29 passing tests covering:

- **loadLocal**: JSON parsing and error handling
- **saveAndSet**: Data persistence and cleanup
- **merge**: Conflict resolution between remote and local data
- **handleAdd**: Creating new expenses
- **handleDelete**: Deleting expenses with different sync states
- **handleEdit**: Updating expenses
- **Sync Categorization**: Filtering for CRUD operations
- **Network Status**: Online/offline detection
- **ID Generation**: Unique ID creation
- **Concurrency**: Sync lock mechanism
- **Error Handling**: Graceful error management

### 5. **TEST_DOCUMENTATION.md**

Comprehensive documentation of all tests, their purpose, and implementation details.

---

## How to Run Tests

```bash
cd /Users/deepanshusaini/Desktop/Projects/ExpenseTrackerMobileApp/frontend

# Run all tests
npm test

# Run useExpenseSync tests only
npm test -- useExpenseSync.test.js

# Run specific test
npm test -- useExpenseSync.test.js -t "should merge without duplicates"

# Run with coverage report
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## Test Results Summary

```
 PASS  src/screens/__tests__/useExpenseSync.test.js
  useExpenseSync - Utility Functions
    loadLocal - Load expenses from AsyncStorage
      ✓ should parse JSON string correctly when valid
      ✓ should handle null/undefined gracefully with try-catch
    saveAndSet - Save expenses to AsyncStorage
      ✓ should filter out null and undefined values
      ✓ should properly stringify data
      ✓ should handle empty arrays
    merge - Merge remote and local expenses
      ✓ should merge without duplicates
      ✓ should prioritize remote data for duplicate IDs
      ✓ should preserve local unsynced items
      ✓ should handle empty remote list
      ✓ should handle empty local list
      ✓ should handle both empty lists
    Expense Operations - Add/Delete/Edit Logic
      handleAdd - Add new expense logic
        ✓ should create expense with local ID and unsynced flag
        ✓ should prepend new expense to list
      handleDelete - Delete expense logic
        ✓ should mark synced expense as deleted
        ✓ should completely remove unsynced expense
        ✓ should not remove if expense not found
      handleEdit - Edit expense logic
        ✓ should update expense and mark as unsynced
        ✓ should preserve original ID on edit
    Sync Categorization Logic
      ✓ should categorize items for create (new, unsynced)
      ✓ should categorize items for delete (synced, marked deleted)
      ✓ should categorize items for update (synced=false, not deleted)
    Network Status Handling
      ✓ should determine online status from network state
      ✓ should handle offline state
      ✓ should handle mixed state (no internet but connected)
    generateLocalId - Unique ID Generation
      ✓ should generate ID with local_ prefix
      ✓ should generate unique IDs
    Concurrent Sync Prevention
      ✓ should prevent multiple simultaneous syncs
    Error Handling
      ✓ should continue sync even if one item fails
      ✓ should use try-catch for error handling

Test Suites: 1 passed, 1 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        0.324 s
```

---

## Key Features Tested

### Data Integrity ✅

- JSON serialization/deserialization
- Data cleanup before persistence
- Proper handling of edge cases (null, undefined, empty arrays)

### Sync Logic ✅

- Merge algorithm without duplicates
- Remote-first conflict resolution
- Preservation of unsynced local items

### CRUD Operations ✅

- Creating items with unique offline IDs
- Deleting items (soft delete for synced, hard delete for unsynced)
- Updating items while maintaining sync state

### Offline Support ✅

- Local ID generation for offline-created items
- Network status detection
- Graceful error handling

### Concurrency ✅

- Prevention of simultaneous sync operations
- Proper flag management

---

## Functions Covered

### merge()

Combines remote and local expenses with conflict resolution:

```javascript
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

### handleAdd()

Creates new local expenses:

```javascript
const newItem = {
  ...expenseData,
  _id: generateLocalId(),
  user: userId,
  synced: false,
  deleted: false,
  date: new Date().toISOString(),
};
```

### handleDelete()

Manages deletion based on sync state:

```javascript
if (item.synced) {
  // Mark for deletion on server
  updated = expenses.map((exp) =>
    exp._id === idToDelete ? { ...exp, deleted: true } : exp
  );
} else {
  // Remove immediately
  updated = expenses.filter((exp) => exp._id !== idToDelete);
}
```

### handleEdit()

Updates with unsynced flag reset:

```javascript
const updatedList = expenses.map((exp) =>
  exp._id === idToEdit ? { ...exp, ...updatedData, synced: false } : exp
);
```

---

## Next Steps

1. **Run the tests**:

   ```bash
   npm test -- useExpenseSync.test.js
   ```

2. **Verify all 29 tests pass**

3. **Check test documentation** in `TEST_DOCUMENTATION.md`

4. **Add more tests** for:

   - Integration tests with real AsyncStorage
   - Network request mocking
   - React hook lifecycle
   - Context integration

5. **Monitor test coverage**:
   ```bash
   npm test -- --coverage
   ```

---

## Troubleshooting

### Tests fail with "Cannot find module"

- Ensure all node_modules are installed: `npm install`
- Clear cache: `npm test -- --clearCache`

### Babel transformation errors

- Check `.babelrc` file exists and is valid
- Verify `@babel/preset-env` and `@babel/preset-react` are installed

### AsyncStorage/NetInfo mocks not working

- Mocks are defined in the test file using `jest.mock()`
- These are unit tests that don't require actual implementations
- For integration tests, use proper mock libraries

---

## Architecture Overview

```
frontend/
├── jest.config.js          # Jest configuration
├── .babelrc                # Babel configuration
├── jest.setup.js           # Jest setup
├── package.json            # Dependencies
└── src/
    └── screens/
        ├── useExpenseSync.js           # Hook being tested
        └── __tests__/
            └── useExpenseSync.test.js  # 29 unit tests
```

---

## Summary

✅ **29 tests created and passing**
✅ **Core sync logic fully tested**
✅ **Offline-first operations validated**
✅ **Error handling verified**
✅ **Network status detection tested**

The test suite provides confidence that the critical expense syncing functionality works correctly across different scenarios and edge cases.
