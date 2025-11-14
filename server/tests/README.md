# API Testing Documentation

## Overview

This directory contains comprehensive tests for the React-Demo API endpoints, specifically focusing on the Users CRUD operations.

## Test Structure

```
tests/
├── setup.js              # Jest setup and configuration
├── testDatabase.js       # Database testing utilities
├── users.test.js         # Unit tests for Users API
└── integration.test.js   # Integration tests for full workflows
```

## Test Types

### Unit Tests (`users.test.js`)

- **GET /api/users** - Test fetching all users
- **POST /api/users** - Test user creation with validation
- **GET /api/users/:id** - Test fetching specific users
- **PUT /api/users/:id** - Test user updates
- **DELETE /api/users/:id** - Test user deletion
- **Error Handling** - Test API error responses

### Integration Tests (`integration.test.js`)

- Full CRUD workflow testing
- CORS headers validation
- Health check endpoints
- Error handling for malformed requests

## Running Tests

### Local Testing

```bash
# Install test dependencies
cd server
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Environment

Tests use a separate test database (`React-Demo-Test`) to avoid affecting production data:

- **Database**: `React-Demo-Test` (LocalDB)
- **Port**: `3002` (separate from main server)
- **Environment**: `.env.test`

## CI/CD Integration

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline (`.github/workflows/ci-cd.yml`) that:

1. **Tests** - Runs on multiple Node.js versions (18.x, 20.x)
2. **Linting** - Code quality checks
3. **Security** - Vulnerability scanning
4. **Deploy** - Automated deployment on main branch

### Test Matrix

Tests run on:

- **OS**: Windows (for cross-platform testing)
- **Node.js**: 18.x and 20.x
- **Database**: MySQL (with in-memory fallback)

## Database Testing

### Test Database Setup

```sql
-- Test database is automatically created
CREATE DATABASE [React-Demo-Test]

-- Users table for testing
CREATE TABLE Users (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  FirstName NVARCHAR(100) NOT NULL,
  LastName NVARCHAR(100) NOT NULL,
  Email NVARCHAR(100) NOT NULL,
  IsActive BIT NOT NULL
)
```

### Test Data Management

- **Cleanup**: Automatic cleanup of test data after each test
- **Isolation**: Each test runs independently
- **Test Users**: Use `@test.com` email domain for easy identification

## Test Utilities

### TestDatabase Class

```javascript
const TestDatabase = require('./testDatabase')

// Clean up test data
await TestDatabase.cleanup()

// Create test user
const user = await TestDatabase.createTestUser({
	FirstName: 'Test',
	LastName: 'User',
	Email: 'test@test.com',
})

// Setup test schema
await TestDatabase.setupSchema()
```

## Coverage Reporting

Test coverage is automatically generated and includes:

- **Statements**: Line coverage
- **Branches**: Conditional coverage
- **Functions**: Function coverage
- **Lines**: Physical line coverage

Coverage reports are uploaded to Codecov in CI/CD pipeline.

## Best Practices

### Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Test both success and error scenarios
- Include edge cases and validation

### Database Testing

- Always clean up test data
- Use separate test database
- Test with realistic data
- Verify state changes

### API Testing

- Test all HTTP methods
- Validate response structure
- Check status codes
- Test error responses

## Debugging Tests

### Local Debugging

```bash
# Run specific test file
npm test users.test.js

# Run tests with verbose output
npm test -- --verbose

# Debug failing tests
npm test -- --detectOpenHandles
```

### Common Issues

1. **Database Connection**: Ensure LocalDB is running
2. **Port Conflicts**: Make sure test ports are available
3. **Test Data**: Check for leftover test data
4. **Environment**: Verify `.env.test` configuration

## Future Enhancements

- [ ] Add performance tests
- [ ] Implement load testing
- [ ] Add API documentation tests
- [ ] Include contract testing
- [ ] Add visual regression tests for UI

## Contributing

When adding new API endpoints:

1. Add unit tests in appropriate test file
2. Include integration tests for workflows
3. Update test documentation
4. Ensure CI/CD pipeline passes
5. Maintain test coverage above 80%
