param(
  [Parameter(Mandatory = $false)]
  [string]$PdfPath = "Door Pictures\Door Pictures-2.pdf",

  [Parameter(Mandatory = $false)]
  [string]$OutputDir = "Door Pictures\extracted-images",

  [Parameter(Mandatory = $false)]
  [int]$Dpi = 300
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$script:HadNativePreference = $false
$script:PrevNativePreference = $null
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $script:HadNativePreference = $true
  $script:PrevNativePreference = $PSNativeCommandUseErrorActionPreference
  $PSNativeCommandUseErrorActionPreference = $false
}

function Test-Tool {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "Required tool '$Name' was not found in PATH."
  }
  return $cmd.Source
}

function Get-SafeFileName {
  param([string]$Name)
  $invalid = [System.IO.Path]::GetInvalidFileNameChars()
  $chars = $Name.ToCharArray() | ForEach-Object {
    if ($invalid -contains $_) { "_" } else { $_ }
  }
  $s = -join $chars
  $s = $s.Trim()
  if ([string]::IsNullOrWhiteSpace($s)) { $s = "unnamed" }
  return $s
}

function New-UniquePath {
  param(
    [string]$Folder,
    [string]$BaseName,
    [string]$Ext
  )
  $candidate = Join-Path $Folder ($BaseName + $Ext)
  if (-not (Test-Path $candidate)) { return $candidate }
  $i = 2
  while ($true) {
    $candidate = Join-Path $Folder ("{0}_{1}{2}" -f $BaseName, $i, $Ext)
    if (-not (Test-Path $candidate)) { return $candidate }
    $i++
  }
}

function Parse-BBoxXml {
  param([string]$XmlPath)

  $xml = New-Object System.Xml.XmlDocument
  $xml.Load($XmlPath)
  $result = @()

  $pageNodes = $xml.SelectNodes("//*[local-name()='doc']/*[local-name()='page']")
  foreach ($page in $pageNodes) {
    $pageIndex = [int]$result.Count # placeholder initialization not used directly
    $pageWidth = [double]$page.width
    $pageHeight = [double]$page.height
    # Page numbering is implicit from document order
    if (-not (Get-Variable -Name __pageCounter -Scope Local -ErrorAction SilentlyContinue)) {
      $local:__pageCounter = 0
    }
    $local:__pageCounter++
    $pageIndex = $local:__pageCounter

    $lineNodes = $page.SelectNodes(".//*[local-name()='line']")
    foreach ($line in $lineNodes) {
          $words = @($line.SelectNodes("./*[local-name()='word']"))
          if (-not $words -or $words.Count -eq 0) { continue }

          $text = (($words | ForEach-Object { $_.InnerText }) -join " ").Trim()
          if ([string]::IsNullOrWhiteSpace($text)) { continue }

          # Door labels look like F117-ELITE VIEW / Y147-CLIMBING OAK / F120S-...
          if ($text -notmatch '^[A-Z]\d+[A-Z]?-') { continue }

          $result += [pscustomobject]@{
            PageIndex = $pageIndex
            PageWidth = $pageWidth
            PageHeight = $pageHeight
            Text = $text
            XMin = [double]$line.xMin
            YMin = [double]$line.yMin
            XMax = [double]$line.xMax
            YMax = [double]$line.yMax
          }
    }
  }

  return $result
}

function Get-RenderFilesByPage {
  param([string]$Folder)

  $files = Get-ChildItem -Path $Folder -Filter "page-*.png" | Sort-Object Name
  $map = @{}
  foreach ($f in $files) {
    if ($f.BaseName -match 'page-(\d+)$') {
      $pageNum = [int]$Matches[1]
      $map[$pageNum] = $f.FullName
    }
  }
  return $map
}

function Find-DarkBoundingBox {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$X1,
    [int]$Y1,
    [int]$X2,
    [int]$Y2,
    [int]$Threshold = 220
  )

  $minX = [Math]::Max(0, [Math]::Min($X1, $Bitmap.Width - 1))
  $minY = [Math]::Max(0, [Math]::Min($Y1, $Bitmap.Height - 1))
  $maxX = [Math]::Max(0, [Math]::Min($X2, $Bitmap.Width - 1))
  $maxY = [Math]::Max(0, [Math]::Min($Y2, $Bitmap.Height - 1))

  if ($maxX -lt $minX -or $maxY -lt $minY) { return $null }

  $found = $false
  $bx1 = $maxX
  $by1 = $maxY
  $bx2 = $minX
  $by2 = $minY

  for ($y = $minY; $y -le $maxY; $y++) {
    for ($x = $minX; $x -le $maxX; $x++) {
      $p = $Bitmap.GetPixel($x, $y)
      if ($p.R -lt $Threshold -or $p.G -lt $Threshold -or $p.B -lt $Threshold) {
        $found = $true
        if ($x -lt $bx1) { $bx1 = $x }
        if ($y -lt $by1) { $by1 = $y }
        if ($x -gt $bx2) { $bx2 = $x }
        if ($y -gt $by2) { $by2 = $y }
      }
    }
  }

  if (-not $found) { return $null }

  return [pscustomobject]@{ X1 = $bx1; Y1 = $by1; X2 = $bx2; Y2 = $by2 }
}

function Save-Crop {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [pscustomobject]$Box,
    [string]$Path
  )

  $w = [Math]::Max(1, $Box.X2 - $Box.X1 + 1)
  $h = [Math]::Max(1, $Box.Y2 - $Box.Y1 + 1)
  $rect = New-Object System.Drawing.Rectangle($Box.X1, $Box.Y1, $w, $h)
  $crop = $Bitmap.Clone($rect, $Bitmap.PixelFormat)
  try {
    $crop.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $crop.Dispose()
  }
}

Test-Tool "pdftotext" | Out-Null
Test-Tool "pdftoppm" | Out-Null

$pdfFullPath = (Resolve-Path $PdfPath).Path
$outFullPath = Join-Path (Get-Location) $OutputDir
New-Item -ItemType Directory -Force -Path $outFullPath | Out-Null

$workDir = Join-Path $env:TEMP ("door-pdf-extract-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $workDir | Out-Null

try {
  $xmlPath = Join-Path $workDir "bbox.xml"
  # pdftotext exits non-zero in this environment because MiKTeX logging is blocked, but it still writes output.
  $prevErr = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & pdftotext -bbox-layout $pdfFullPath $xmlPath 2>$null
  $ErrorActionPreference = $prevErr

  if (-not (Test-Path $xmlPath)) {
    throw "Failed to create bbox XML with pdftotext."
  }

  $labels = Parse-BBoxXml -XmlPath $xmlPath
  if (-not $labels -or $labels.Count -eq 0) {
    throw "No door labels found in PDF text layer."
  }

  $renderPrefix = Join-Path $workDir "page"
  # Use pdftoppm for page rendering; each page becomes page-01.png, page-02.png, ...
  $prevErr = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & pdftoppm -png -r $Dpi $pdfFullPath $renderPrefix 2>$null
  $ErrorActionPreference = $prevErr

  Add-Type -AssemblyName System.Drawing
  $renderMap = Get-RenderFilesByPage -Folder $workDir
  if ($renderMap.Count -eq 0) {
    throw "No rendered PNG pages found."
  }

  $summary = New-Object System.Collections.Generic.List[object]

  foreach ($group in ($labels | Group-Object PageIndex | Sort-Object Name)) {
    $pageNum = [int]$group.Name
    if (-not $renderMap.ContainsKey($pageNum)) {
      Write-Warning "Skipping page $pageNum (rendered image not found)."
      continue
    }

    $pageFile = $renderMap[$pageNum]
    $bitmap = [System.Drawing.Bitmap]::FromFile($pageFile)
    try {
      $pageMeta = $group.Group | Select-Object -First 1
      $scaleX = $bitmap.Width / [double]$pageMeta.PageWidth
      $scaleY = $bitmap.Height / [double]$pageMeta.PageHeight

      foreach ($label in ($group.Group | Sort-Object YMin, XMin)) {
        $labelText = $label.Text
        $baseName = Get-SafeFileName $labelText
        $cxPt = ($label.XMin + $label.XMax) / 2.0

        # Search in a fixed window above the label; the report layout is a regular grid.
        $searchHalfWidthPt = 52
        $searchTopGapPt = 170
        $searchBottomGapPt = 5

        $sx1 = [int][Math]::Floor(($cxPt - $searchHalfWidthPt) * $scaleX)
        $sx2 = [int][Math]::Ceiling(($cxPt + $searchHalfWidthPt) * $scaleX)
        $sy1 = [int][Math]::Floor(([Math]::Max(0, $label.YMin - $searchTopGapPt)) * $scaleY)
        $sy2 = [int][Math]::Ceiling(([Math]::Max(0, $label.YMin - $searchBottomGapPt)) * $scaleY)

        $box = Find-DarkBoundingBox -Bitmap $bitmap -X1 $sx1 -Y1 $sy1 -X2 $sx2 -Y2 $sy2 -Threshold 220
        if (-not $box) {
          Write-Warning "No drawing found above label '$labelText' on page $pageNum."
          continue
        }

        # Expand slightly to avoid clipping anti-aliased edges.
        $pad = [int][Math]::Round(2 * ($Dpi / 150.0))
        $box.X1 = [Math]::Max(0, $box.X1 - $pad)
        $box.Y1 = [Math]::Max(0, $box.Y1 - $pad)
        $box.X2 = [Math]::Min($bitmap.Width - 1, $box.X2 + $pad)
        $box.Y2 = [Math]::Min($bitmap.Height - 1, $box.Y2 + $pad)

        $outPath = New-UniquePath -Folder $outFullPath -BaseName $baseName -Ext ".png"
        Save-Crop -Bitmap $bitmap -Box $box -Path $outPath

        $summary.Add([pscustomobject]@{
          Page = $pageNum
          Label = $labelText
          File = $outPath
          Width = ($box.X2 - $box.X1 + 1)
          Height = ($box.Y2 - $box.Y1 + 1)
        }) | Out-Null
      }
    } finally {
      $bitmap.Dispose()
    }
  }

  $summaryPath = Join-Path $outFullPath "extract-summary.csv"
  $summary | Export-Csv -NoTypeInformation -Path $summaryPath

  Write-Host "Extracted $($summary.Count) images to: $outFullPath"
  Write-Host "Summary: $summaryPath"
} finally {
  if ($script:HadNativePreference) {
    $PSNativeCommandUseErrorActionPreference = $script:PrevNativePreference
  }
  if (Test-Path $workDir) {
    Remove-Item -Recurse -Force $workDir
  }
}
