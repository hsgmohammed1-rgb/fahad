$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = 'C:\Users\MOH\Documents\GG\fahad\fahad'
$svg = Get-Content (Join-Path $root '8765897.svg') -Raw
$m = [regex]::Match($svg, 'base64,([A-Za-z0-9+/=]+)')
$bytes = [Convert]::FromBase64String($m.Groups[1].Value)

$out = Join-Path $root 'public\fahad-logo.png'
[IO.File]::WriteAllBytes($out, $bytes)

$img = [System.Drawing.Image]::FromFile($out)
Write-Output ("LOGO {0}x{1} -> public\fahad-logo.png ({2} bytes)" -f $img.Width, $img.Height, $bytes.Length)
$img.Dispose()
