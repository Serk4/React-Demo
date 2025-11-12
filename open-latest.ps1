# Quick script to open latest deployment
$latest = (vercel ls | Select-String -Pattern "https://react-demo-[a-z0-9]+-davids-projects-8b1113d6\.vercel\.app" | Select-Object -First 1).Matches.Value
if ($latest) {
    Write-Host "🌐 Opening latest deployment: $latest" -ForegroundColor Green
    Start-Process $latest
} else {
    Write-Host "❌ Could not find latest deployment URL" -ForegroundColor Red
}