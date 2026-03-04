#!/usr/bin/env pwsh
# Pre-push test script - Run this before pushing to GitHub

Write-Host "Running pre-push checks..." -ForegroundColor Cyan

# 1. Check JavaScript syntax  
Write-Host "Checking JavaScript syntax..." -ForegroundColor Yellow
try {
    node -c routes/users.js
    node -c routes/roles.js
    Write-Host "Syntax check passed" -ForegroundColor Green
}
catch {
    Write-Host "Syntax errors found! Fix before pushing." -ForegroundColor Red
    exit 1
}

# 2. Run all tests
Write-Host "Running all tests..." -ForegroundColor Yellow
npm test -- --maxWorkers=1
if ($LASTEXITCODE -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    Write-Host "Ready to push to GitHub!" -ForegroundColor Cyan
}
else {
    Write-Host "Tests failed! Review and fix before pushing." -ForegroundColor Red
    Write-Host "Test output above shows which tests need attention." -ForegroundColor Yellow
    exit 1
}