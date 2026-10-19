$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = 'C:\Users\MOH\Documents\GG\fahad\fahad'
$pub  = Join-Path $root 'public'

# ---- 1. Cinematic gold fortress background ----
$src = Join-Path $root 'f4682259-56fa-4dd7-a047-724e4dbb282f.png'
$bg  = Join-Path $pub 'fahad-bg.png'
Copy-Item -LiteralPath $src -Destination $bg -Force
$bgi = [System.Drawing.Image]::FromFile($bg)
Write-Output ("BG  {0}x{1}  -> public\fahad-bg.png  ({2:N0} bytes)" -f $bgi.Width, $bgi.Height, (Get-Item $bg).Length)
$bgi.Dispose()

# ---- 2. Logo: SVG wraps a jpeg; emit a plain PNG for <img> + favicon ----
$svg = Get-Content (Join-Path $root '8765897.svg') -Raw
$m = [regex]::Match($svg, 'base64,([A-Za-z0-9+/=]+)')
$raw = [Convert]::FromBase64String($m.Groups[1].Value)
$tmp = Join-Path $env:TEMP 'fahad_logo_raw.jpg'
[IO.File]::WriteAllBytes($tmp, $raw)
$img = [System.Drawing.Image]::FromFile($tmp)

foreach ($pair in @(@('fahad-logo.png', 512), @('fahad-logo-180.png', 180), @('fahad-logo-64.png', 64))) {
    $name = $pair[0]; $size = [int]$pair[1]
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()
    $out = Join-Path $pub $name
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output ("LOG {0}x{0}  -> public\{1}  ({2:N0} bytes)" -f $size, $name, (Get-Item $out).Length)
}

# ---- 3. Browser favicon (.ico with 16/32/48) ----
$icoSizes = @(16, 32, 48)
$bitmaps = foreach ($s in $icoSizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $s, $s)
    $g.Dispose()
    ,$bmp
}
$tmpIco = Join-Path $env:TEMP 'fahad_favicon.ico'
$fs = [IO.File]::Create($tmpIco)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$icoSizes.Count)
$offset = 6 + (16 * $icoSizes.Count)
foreach ($b in $bitmaps) {
    $ms = New-Object IO.MemoryStream
    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray(); $ms.Dispose()
    $bw.Write([Byte]$b.Width); $bw.Write([Byte]$b.Height); $bw.Write([Byte]0); $bw.Write([Byte]0)
    $bw.Write([UInt16]1); $bw.Write([UInt16]32)
    $bw.Write([UInt32]$bytes.Length); $bw.Write([UInt32]$offset)
    $offset += $bytes.Length
}
foreach ($b in $bitmaps) { $bw.Write($b.ToArray()); $b.Dispose() }
$bw.Flush(); $bw.Close(); $fs.Close()
Copy-Item -LiteralPath $tmpIco -Destination (Join-Path $pub 'favicon.ico') -Force
Write-Output ("ICO 16/32/48  -> public\favicon.ico  ({0:N0} bytes)" -f (Get-Item (Join-Path $pub 'favicon.ico')).Length)

$img.Dispose()
Remove-Item -LiteralPath $tmp, $tmpIco -Force -ErrorAction SilentlyContinue
Write-Output 'ASSETS OK'
