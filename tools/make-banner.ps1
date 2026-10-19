$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = 'C:\Users\MOH\Documents\GG\fahad\fahad'
$pub  = Join-Path $root 'public'
$W = 1200; $H = 630

$bmp = [System.Drawing.Bitmap]::new($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# --- backdrop: the cinematic gold fortress art, cover-fit ---
$bg = [System.Drawing.Image]::FromFile((Join-Path $pub 'fahad-bg.png'))
$scale = [Math]::Max($W / $bg.Width, $H / $bg.Height)
$dw = [int]($bg.Width * $scale); $dh = [int]($bg.Height * $scale)
$g.DrawImage($bg, [int](($W - $dw) / 2), [int](($H - $dh) / 2), $dw, $dh)
$bg.Dispose()

# --- readability scrim ---
$p0 = [System.Drawing.Point]::new(0, 0)
$p1 = [System.Drawing.Point]::new(0, $H)
$scrim = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]$p0, [System.Drawing.Point]$p1,
    [System.Drawing.Color]::FromArgb(0, 8, 6, 10), [System.Drawing.Color]::FromArgb(236, 8, 6, 10))
$g.FillRectangle($scrim, 0, 0, $W, $H)
$scrim.Dispose()

# --- vignette ---
$vp = [System.Drawing.Drawing2D.GraphicsPath]::new()
$vp.AddEllipse(-260, -200, $W + 520, $H + 400)
$vb = [System.Drawing.Drawing2D.PathGradientBrush]::new($vp)
$vb.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
$vb.SurroundColors = [System.Drawing.Color[]]@([System.Drawing.Color]::FromArgb(195, 4, 3, 5))
$g.FillRectangle($vb, 0, 0, $W, $H)
$vb.Dispose(); $vp.Dispose()

# --- logo disc, circular-clipped so no square edge shows ---
$logo = [System.Drawing.Image]::FromFile((Join-Path $pub 'fahad-logo.png'))
$ls = 168; $lx = [int](($W - $ls) / 2); $ly = 80
$halo = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(55, 242, 179, 61))
$g.FillEllipse($halo, $lx - 20, $ly - 20, $ls + 40, $ls + 40)
$halo.Dispose()

$clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
$clip.AddEllipse($lx, $ly, $ls, $ls)
$oldClip = $g.Clip
$g.SetClip($clip)
$g.DrawImage($logo, $lx, $ly, $ls, $ls)
$g.Clip = $oldClip
$clip.Dispose()

$ring = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(210, 253, 239, 201), 3)
$g.DrawEllipse($ring, $lx - 4, $ly - 4, $ls + 8, $ls + 8)
$ring.Dispose()
$logo.Dispose()

# --- FAHAD wordmark in radiant gold ---
$wordFont = [System.Drawing.Font]::new('Segoe UI Black', 116, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fmt = [System.Drawing.StringFormat]::new()
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$fmt.LineAlignment = [System.Drawing.StringAlignment]::Center

$word = 'FAHAD'
$rect = [System.Drawing.RectangleF]::new(0, 286, $W, 150)
$shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(205, 4, 3, 5))
$g.DrawString($word, $wordFont, $shadow, ([float]3), 302, $fmt)
$shadow.Dispose()

# glow pass
$glow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(70, 242, 179, 61))
$g.DrawString($word, $wordFont, $glow, $rect, $fmt)
$g.DrawString($word, $wordFont, $glow, $rect, $fmt)
$glow.Dispose()

# gradient pass — a LinearGradientBrush works directly as a text brush in GDI+
$wb = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.PointF]::new(240, 300), [System.Drawing.PointF]::new(960, 440),
    [System.Drawing.Color]::FromArgb(255, 255, 253, 245),
    [System.Drawing.Color]::FromArgb(255, 242, 179, 61))
$g.DrawString($word, $wordFont, $wb, $rect, $fmt)
$wb.Dispose()

# --- subtitle ---
$subFont = [System.Drawing.Font]::new('Segoe UI', 29, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(215, 226, 196, 140))
$g.DrawString('GOLDEN KINGDOM  //  OFFICIAL HUB', $subFont, $subBrush,
    [System.Drawing.RectangleF]::new(0, 428, $W, 46), $fmt)
$subBrush.Dispose(); $subFont.Dispose()

# --- kick.com/fahad pill ---
$pillFont = [System.Drawing.Font]::new('Segoe UI', 25, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$pw = 244; $ph = 56; $px = [int](($W - $pw) / 2); $py = 508
$pb = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new($px, $py), [System.Drawing.Point]::new(($px + $pw), ($py + $ph)),
    [System.Drawing.Color]::FromArgb(255, 253, 239, 201), [System.Drawing.Color]::FromArgb(255, 184, 134, 43))
$g.FillRectangle($pb, $px, $py, $pw, $ph)
$pb.Dispose()
$darkText = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 8, 6, 10))
$g.DrawString('kick.com/fahad', $pillFont, $darkText, [System.Drawing.RectangleF]::new($px, ($py + 13), $pw, 34), $fmt)
$darkText.Dispose(); $pillFont.Dispose(); $wordFont.Dispose(); $fmt.Dispose()
$g.Dispose()

$out = Join-Path $pub 'fahad-banner.jpg'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
Write-Output ("OG banner {0}x{1} -> public\fahad-banner.jpg ({2:N0} bytes)" -f $W, $H, (Get-Item $out).Length)
