Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-GreenIcon {
  param([int]$Size, [string]$FilePath)
  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $green = [System.Drawing.Color]::FromArgb(16, 185, 129)
  $white = [System.Drawing.Color]::White
  $s = [float]$Size

  $tile = New-RoundedRectPath 0 0 $s $s ($s * 0.22)
  $g.FillPath((New-Object System.Drawing.SolidBrush($green)), $tile)
  $tile.Dispose()

  $rows = @(0.30, 0.50, 0.70)
  $boxSize = $s * 0.10
  $boxRadius = $s * 0.028
  $boxX = $s * 0.18
  $linePen = New-Object System.Drawing.Pen($white, ($s * 0.045))
  $linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whiteBrush = New-Object System.Drawing.SolidBrush($white)
  $checkPen = New-Object System.Drawing.Pen($green, ($s * 0.03))
  $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $checkPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  for ($i = 0; $i -lt 3; $i++) {
    $cy = $s * $rows[$i]
    $box = New-RoundedRectPath $boxX ($cy - $boxSize / 2) $boxSize $boxSize $boxRadius
    if ($i -lt 2) {
      $g.FillPath($whiteBrush, $box)
      $g.DrawLines($checkPen, @(
        (New-Object System.Drawing.PointF(($boxX + $boxSize * 0.20), $cy)),
        (New-Object System.Drawing.PointF(($boxX + $boxSize * 0.42), ($cy + $boxSize * 0.22))),
        (New-Object System.Drawing.PointF(($boxX + $boxSize * 0.82), ($cy - $boxSize * 0.20)))
      ))
    } else {
      $g.DrawPath($linePen, $box)
    }
    $box.Dispose()
    $g.DrawLine($linePen, ($s * 0.34), $cy, ($s * 0.80), $cy)
  }

  $checkPen.Dispose()
  $whiteBrush.Dispose()
  $linePen.Dispose()
  $g.Dispose()
  $bmp.Save($FilePath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Created $FilePath"
}

New-GreenIcon 192 "public\icons\pwa-192.png"
New-GreenIcon 512 "public\icons\pwa-512.png"
New-GreenIcon 180 "public\icons\apple-touch-icon.png"