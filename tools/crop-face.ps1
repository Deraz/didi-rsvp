param([int]$X = 108, [int]$Y = 708, [int]$W = 300, [int]$H = 300)
Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\assets\theme\invitation.jpeg"
$dstPath = Join-Path $PSScriptRoot "..\assets\theme\face.jpg"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
$bmp = New-Object System.Drawing.Bitmap 600, 600
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$srcRect = New-Object System.Drawing.Rectangle $X, $Y, $W, $H
$dstRect = New-Object System.Drawing.Rectangle 0, 0, 600, 600
$g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]80)
$bmp.Save($dstPath, $encoder, $encParams)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()
Write-Output "wrote $dstPath from region ($X,$Y,$W,$H)"
