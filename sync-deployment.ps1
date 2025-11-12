# Two-Step Deployment Sync Script
# Handles the frontend-backend URL synchronization automatically

Write-Host "🚀 Starting Automated Two-Step Deployment Sync..." -ForegroundColor Green
Write-Host ""

# Function to get latest backend URL
function Get-LatestBackendUrl {
    Write-Host "🔍 Getting latest backend URL..." -ForegroundColor Cyan
    cd server
    $output = vercel ls 2>$null | Select-Object -First 10
    $urlPattern = "https://server-[a-z0-9]+-davids-projects-8b1113d6\.vercel\.app"
    
    foreach ($line in $output) {
        if ($line -match $urlPattern) {
            $latestUrl = $matches[0]
            cd ..
            return $latestUrl
        }
    }
    cd ..
    return $null
}

# Function to get current API URL from config
function Get-CurrentApiUrl {
    $apiFile = "src\config\api.ts"
    $content = Get-Content $apiFile -Raw
    if ($content -match "https://server-[a-z0-9]+-davids-projects-8b1113d6\.vercel\.app/api") {
        return $matches[0] -replace "/api", ""
    }
    return $null
}

# Function to update API config
function Update-ApiConfig {
    param($backendUrl)
    
    Write-Host "✏️ Updating API configuration..." -ForegroundColor Cyan
    $apiFile = "src\config\api.ts"
    $content = Get-Content $apiFile -Raw
    
    # Update both test and prod URLs
    $content = $content -replace "https://server-[a-z0-9]+-davids-projects-8b1113d6\.vercel\.app/api", "$backendUrl/api"
    
    Set-Content $apiFile $content
    Write-Host "   ✅ Updated API URLs to: $backendUrl/api" -ForegroundColor Green
}

# Main execution
Write-Host "⏰ Checking if URL sync is needed..." -ForegroundColor Yellow

$latestBackend = Get-LatestBackendUrl
$currentApiUrl = Get-CurrentApiUrl

if ($latestBackend -and $currentApiUrl) {
    Write-Host "   📡 Latest backend: $latestBackend" -ForegroundColor White
    Write-Host "   🔧 Current API config: $currentApiUrl" -ForegroundColor White
    
    if ($latestBackend -ne $currentApiUrl) {
        Write-Host ""
        Write-Host "� URL MISMATCH DETECTED!" -ForegroundColor Red
        Write-Host "   Frontend is pointing to wrong backend URL" -ForegroundColor Red
        Write-Host ""
        
        $sync = Read-Host "Auto-sync URLs? (y/n)"
        if ($sync -eq 'y' -or $sync -eq 'Y') {
            Update-ApiConfig $latestBackend
            
            # Step 2: Commit and push
            Write-Host ""
            Write-Host "🚀 Committing URL sync and triggering deployment..." -ForegroundColor Yellow
            git add src/config/api.ts
            git commit -m "fix: auto-sync API URL to latest backend deployment ($($latestBackend -split '-' | Select-Object -Last 2 | Join-String -Separator '-'))"
            git push origin main
            
            Write-Host ""
            Write-Host "✅ Two-step deployment sync complete!" -ForegroundColor Green
            Write-Host "   ⏰ Wait 2-3 minutes for new frontend deployment" -ForegroundColor White
            Write-Host "   🌐 Then test with: vercel ls | Select-Object -First 1" -ForegroundColor White
            Write-Host "   🎯 Should finally show API users instead of mock users!" -ForegroundColor White
        }
    } else {
        Write-Host ""
        Write-Host "✅ URLs are already synced!" -ForegroundColor Green
        Write-Host "   Frontend and backend are properly connected" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "❌ Could not detect backend or API URLs" -ForegroundColor Red
    Write-Host "   Please check deployment status manually" -ForegroundColor White
}