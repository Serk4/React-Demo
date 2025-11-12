# Pre-Commit Testing Script
# Run this before every git commit to catch issues early

Write-Host "🧪 Running Pre-Commit Tests..." -ForegroundColor Green
Write-Host ""

$errors = @()

# Test 1: Backend Tests
Write-Host "🔧 Running Backend Tests..." -ForegroundColor Yellow
cd server
$backendTestResult = npm test
if ($LASTEXITCODE -ne 0) {
    $errors += "Backend tests failed"
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
} else {
    Write-Host "✅ Backend tests passed!" -ForegroundColor Green
}
cd ..

# Test 2: Frontend Build
Write-Host ""
Write-Host "🏗️ Testing Frontend Build..." -ForegroundColor Yellow
$frontendBuildResult = npm run build
if ($LASTEXITCODE -ne 0) {
    $errors += "Frontend build failed"
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
} else {
    Write-Host "✅ Frontend build successful!" -ForegroundColor Green
}

# Test 3: Linting
Write-Host ""
Write-Host "🔍 Running Linter..." -ForegroundColor Yellow
$lintResult = npm run lint
if ($LASTEXITCODE -ne 0) {
    $errors += "Linting failed"
    Write-Host "❌ Linting failed!" -ForegroundColor Red
} else {
    Write-Host "✅ No linting errors!" -ForegroundColor Green
}

# Test 4: Backend Build (if applicable)
Write-Host ""
Write-Host "📦 Testing Backend Dependencies..." -ForegroundColor Yellow
cd server
$backendInstallResult = npm ci --silent
if ($LASTEXITCODE -ne 0) {
    $errors += "Backend dependency issues"
    Write-Host "❌ Backend dependency issues!" -ForegroundColor Red
} else {
    Write-Host "✅ Backend dependencies OK!" -ForegroundColor Green
}
cd ..

# Summary
Write-Host ""
Write-Host "📊 Pre-Commit Test Results:" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Ready to commit." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  git add ." -ForegroundColor Gray
    Write-Host "  git commit -m 'your message'" -ForegroundColor Gray
    Write-Host "  git push origin main" -ForegroundColor Gray
} else {
    Write-Host "❌ ISSUES FOUND - Fix before committing:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Fix these issues and run this script again." -ForegroundColor Yellow
}

Write-Host ""