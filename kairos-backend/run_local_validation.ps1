# run_local_validation.ps1
$ErrorActionPreference = "Stop"
$root = Get-Location
Write-Host "Root: $root"

# 1. Backup .env
$envPath = Join-Path $root ".env"
$envBak = Join-Path $root ".env.bak"
if (Test-Path $envPath) {
  Write-Host "Backing up .env..."
  Copy-Item $envPath $envBak -Force
  Remove-Item $envPath -Force
}

# 2. Node Version
node -v > ..\node_version.txt 2>&1

# 3. Install
Write-Host "Installing dependencies..."
cmd /c "npm ci" 2>&1 | Out-File -Encoding utf8 ..\npm_ci_output.log
if ($LASTEXITCODE -ne 0) { 
    Write-Host "npm ci failed, trying install..."
    cmd /c "npm install" 2>&1 | Out-File -Encoding utf8 ..\npm_install_output.log
}

# 4. Start Server
$stdout = "..\server_startup.log"
$stderr = "..\server_startup_err.log"
Write-Host "Starting server..."
$proc = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stderr
Start-Sleep -Seconds 2

# 5. Wait for Port (Robust .NET Fallback) - 60s Timeout
$port = 10000
$timeout = 60
$waited = 0
$open = $false

while ($waited -lt $timeout) {
    try {
        # Tenta método nativo PS
        if (Get-Command Test-NetConnection -ErrorAction SilentlyContinue) {
            if ((Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue).TcpTestSucceeded) { $open = $true; break }
        }
        # Fallback para .NET Sockets (Funciona em qualquer Windows)
        $tcp = New-Object System.Net.Sockets.TcpClient
        $connect = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
        if ($connect.AsyncWaitHandle.WaitOne(500, $false)) {
            if ($tcp.Connected) { $open = $true; $tcp.Close(); break }
        }
        $tcp.Close()
    } catch {}
    
    Start-Sleep -Seconds 1
    $waited++
}

if (-not $open) { Write-Error "Server failed to bind port $port." }

# 6. Run Smoke
Write-Host "Running Smoke Tests..."
cmd /c "npm run smoke"

# 7. Validate Logs (Fallback)
if (!(Test-Path ..\validation.log)) {
  Write-Host "Fallback verification..."
  "" | Out-File -Encoding utf8 ..\validation.log
  try { (Invoke-WebRequest -Uri "http://localhost:10000/status").Content | Out-File -Append -Encoding utf8 ..\validation.log } catch {}
}

# 8. Cleanup
try { if (!$proc.HasExited) { Stop-Process -Id $proc.Id -Force } } catch {}
if (Test-Path $envBak) { Copy-Item $envBak $envPath -Force; Remove-Item $envBak -Force }

Write-Host "Done. Check logs."
