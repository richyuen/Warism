# Critic run 77: memory guard. `landingRows all` holds ~10 GB; with the lanes running it would starve the machine. This
# stops it if the named chain starts it, and notes it in critic/c77_guardRows.log; it is run again alone later
# (critic/scripts/c77_rowsAlone.sh).
$log = 'C:\Git\Warism\critic\c77_guardRows.log'
while (-not (Test-Path 'C:\Git\Warism\critic\c77_named.done')) {
  $p = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'landingRows\.ts all' }
  foreach ($x in $p) { Stop-Process -Id $x.ProcessId -Force -ErrorAction SilentlyContinue; Add-Content $log "$(Get-Date -Format HH:mm:ss) stopped $($x.ProcessId)" }
  Start-Sleep -Seconds 3
}
Add-Content $log "$(Get-Date -Format HH:mm:ss) named done, guard ends"
