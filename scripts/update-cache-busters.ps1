<#
.SYNOPSIS
  Updates CSS/JS cache-buster query strings in HTML files.

.DESCRIPTION
  Finds local <link href="...css"> and <script src="...js"> references in HTML files,
  computes a short SHA-256 hash for each referenced asset, and rewrites the URL as:

    asset.css?v=<hash>

  External URLs, anchors, data URLs, and mailto links are ignored.

.PARAMETER Root
  Root folder to scan. Defaults to the current directory.

.PARAMETER HashLength
  Number of SHA-256 characters to use. Defaults to 10.

.PARAMETER DryRun
  Shows what would change without writing files.
#>

[CmdletBinding()]
param(
  [Parameter()]
  [string]$Root = (Get-Location).Path,

  [Parameter()]
  [ValidateRange(1, 64)]
  [int]$HashLength = 10,

  [Parameter()]
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------

$ResolvedRoot = (Resolve-Path -LiteralPath $Root).Path
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# Match local CSS/JS href/src values, while ignoring URLs that are clearly remote
# or non-file references.
$AssetAttributePattern = @'
(?<prefix>\b(?:href|src)=["'])(?<path>(?!https?:|//|data:|mailto:|#)[^"'?#]+?\.(?:css|js))(?:\?v=[^"']*)?(?<suffix>["'])
'@.Trim()

$AssetAttributeRegex = [regex]::new(
  $AssetAttributePattern,
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

$HashCache = @{}
$Updates = [System.Collections.Generic.List[string]]::new()
$Warnings = [System.Collections.Generic.List[string]]::new()

$IgnoredDirectoryNames = @(
  '.conda',
  '.git',
  '.vscode',
  'node_modules'
)

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

function Test-IsIgnoredPath {
  param(
    [Parameter(Mandatory)]
    [string]$Path
  )

  $parts = $Path -split '[\\/]+'

  foreach ($ignored in $IgnoredDirectoryNames) {
    if ($parts -contains $ignored) { return $true }
  }

  return $false
}

function Get-ShortHash {
  param(
    [Parameter(Mandatory)]
    [string]$Path
  )

  if (-not $HashCache.ContainsKey($Path)) {
    $fullHash = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
    $length = [Math]::Min($HashLength, $fullHash.Length)
    $HashCache[$Path] = $fullHash.Substring(0, $length)
  }

  return $HashCache[$Path]
}

function Get-RelativePathForLog {
  param(
    [Parameter(Mandatory)]
    [string]$Path
  )

  if ($Path.StartsWith($ResolvedRoot)) {
    $relativePath = $Path.Substring($ResolvedRoot.Length)
    return ($relativePath -replace '^[\\/]+', '')
  }

  return $Path
}

function Resolve-LocalAssetPath {
  param(
    [Parameter(Mandatory)]
    [System.IO.FileInfo]$HtmlFile,

    [Parameter(Mandatory)]
    [string]$AssetPath
  )

  $localAssetPath = $AssetPath -replace '/', [System.IO.Path]::DirectorySeparatorChar
  $candidatePath = Join-Path -Path $HtmlFile.DirectoryName -ChildPath $localAssetPath

  return Resolve-Path -LiteralPath $candidatePath -ErrorAction SilentlyContinue
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

$HtmlFiles = Get-ChildItem -LiteralPath $ResolvedRoot -Recurse -File -Filter '*.html' |
  Where-Object { -not (Test-IsIgnoredPath -Path $_.FullName) }

foreach ($HtmlFile in $HtmlFiles) {
  $Original = [System.IO.File]::ReadAllText($HtmlFile.FullName)

  $Updated = $AssetAttributeRegex.Replace($Original, {
    param($Match)

    $assetPath = $Match.Groups['path'].Value
    $resolvedAsset = Resolve-LocalAssetPath -HtmlFile $HtmlFile -AssetPath $assetPath

    if (-not $resolvedAsset) {
      $relativeHtml = Get-RelativePathForLog -Path $HtmlFile.FullName
      $Warnings.Add("Missing asset from $relativeHtml`: $assetPath")
      return $Match.Value
    }

    $hash = Get-ShortHash -Path $resolvedAsset.Path
    $replacement = "$($Match.Groups['prefix'].Value)${assetPath}?v=$hash$($Match.Groups['suffix'].Value)"

    if ($replacement -ne $Match.Value) {
      $relativeHtml = Get-RelativePathForLog -Path $HtmlFile.FullName
      $Updates.Add("$relativeHtml :: $assetPath -> v=$hash")
    }

    return $replacement
  })

  if (($Updated -ne $Original) -and -not $DryRun) {
    [System.IO.File]::WriteAllText($HtmlFile.FullName, $Updated, $Utf8NoBom)
  }
}

# -----------------------------------------------------------------------------
# Output
# -----------------------------------------------------------------------------

if ($Warnings.Count -gt 0) {
  Write-Warning ($Warnings -join [Environment]::NewLine)
}

if ($Updates.Count -eq 0) {
  Write-Output 'No cache-buster updates needed.'
  return
}

if ($DryRun) {
  Write-Output 'Dry run: cache-buster updates that would be applied:'
} else {
  Write-Output 'Updated cache-busters:'
}

$Updates |
  Sort-Object |
  ForEach-Object { Write-Output "  $_" }
