param([int]$X = 60, [int]$Y = 640, [int]$W = 400, [int]$H = 400)
Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\assets\theme\invitation.jpeg"
$dstPath = Join-Path $PSScriptRoot "..\assets\theme\face.png"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
$bmp = New-Object System.Drawing.Bitmap 600, 600
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$srcRect = New-Object System.Drawing.Rectangle $X, $Y, $W, $H
$dstRect = New-Object System.Drawing.Rectangle 0, 0, 600, 600
$g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()
Write-Output "wrote $dstPath from region ($X,$Y,$W,$H)"
