$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = 'C:\Users\MOH\Documents\GG\fahad\fahad'
$pub  = Join-Path $root 'public'

$svg = Get-Content (Join-Path $root '8765897.svg') -Raw
$m = [regex]::Match($svg, 'base64,([A-Za-z0-9+/=]+)')
$tmp = Join-Path $env:TEMP 'fahad_logo_raw.jpg'
[IO.File]::WriteAllBytes($tmp, [Convert]::FromBase64String($m.Groups[1].Value))
$img = [System.Drawing.Image]::FromFile($tmp)

$icoSizes = @(16, 32, 48)
$pngBytes = @()
foreach ($s in $icoSizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $s, $s)
    $g.Dispose()
    $ms = New-Object IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytes += , $ms.ToArray()
    $ms.Dispose(); $bmp.Dispose()
}
$img.Dispose()
Remove-Item -LiteralPath $tmp -Force

$tmpIco = Join-Path $env:TEMP 'fahad_favicon.ico'
$fs = [IO.File]::Create($tmpIco)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$icoSizes.Count)
$offset = 6 + (16 * $icoSizes.Count)
for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $s = $icoSizes[$i]; $len = $pngBytes[$i].Length
    $bw.Write([Byte]$s); $bw.Write([Byte]$s); $bw.Write([Byte]0); $bw.Write([Byte]0)
    $bw.Write([UInt16]1); $bw.Write([UInt16]32)
    $bw.Write([UInt32]$len); $bw.Write([UInt32]$offset)
    $offset += $len
}
for ($i = 0; $i -lt $icoSizes.Count; $i++) { $bw.Write($pngBytes[$i]) }
$bw.Flush(); $bw.Close(); $fs.Close()

Copy-Item -LiteralPath $tmpIco -Destination (Join-Path $pub 'favicon.ico') -Force
Remove-Item -LiteralPath $tmpIco -Force
Write-Output ("ICO 16/32/48  -> public\favicon.ico  ({0:N0} bytes)" -f (Get-Item (Join-Path $pub 'favicon.ico')).Length)
Write-Output 'FAVICON OK'
