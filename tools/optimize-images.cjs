/* One-off: shrink the heavy public images.
   - og-banner.png      873 KB -> JPEG (no transparency needed)
   - discord-banner.png 961 KB -> JPEG
   - fahad-logo.png     148 KB -> smaller PNG
   UTF-8 safe / Windows friendly. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..', 'public');

function pngInfo(f) {
    const b = fs.readFileSync(f);
    return { size: b.length, w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// --- og-banner: PNG -> JPEG via .NET (quality 88) ------------------------
const ps = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('${root}\\og-banner.png')
$bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode='HighQuality'; $g.InterpolationMode='HighQualityBicubic'
$g.DrawImage($src,0,0,$src.Width,$src.Height)
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$par = New-Object System.Drawing.Imaging.EncoderParameters 1
$par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88
$bmp.Save('${root}\\og-banner.jpg', $enc, $par)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()
Write-Output 'og jpg done'
`;
execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });

// --- discord-banner: PNG -> JPEG ------------------------------------------
const ps2 = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('${root}\\discord-banner.png')
$bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode='HighQualityBicubic'
$g.DrawImage($src,0,0,$src.Width,$src.Height)
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$par = New-Object System.Drawing.Imaging.EncoderParameters 1
$par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 86
$bmp.Save('${root}\\discord-banner.jpg', $enc, $par)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()
Write-Output 'discord jpg done'
`;
execFileSync('powershell', ['-NoProfile', '-Command', ps2], { stdio: 'inherit' });

for (const f of ['og-banner.png', 'discord-banner.png']) {
    const p = path.join(root, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
}
for (const f of ['og-banner.jpg', 'discord-banner.jpg']) {
    const p = path.join(root, f);
    console.log(f, Math.round(fs.statSync(p).size / 1024) + ' KB');
}
