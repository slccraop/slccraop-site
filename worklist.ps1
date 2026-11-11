<#
 SLCCRAOP worklist tool. READ-ONLY. The only way to create work items and verify items.
   .\worklist.ps1 -Action Status
   .\worklist.ps1 -Action Next
   .\worklist.ps1 -Action NewWork -Id 1 -Title '...' -Ref 'manual T0.1' -Description '...' -Done '...' [-Depends 1,2] [-ReworkOf 7]
   .\worklist.ps1 -Action NewVerify -Id 1 -Result PASS -Summary '...' -Evidence '...'
   .\worklist.ps1 -Action Audit
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidateSet('Status','Next','NewWork','NewVerify','Audit')][string]$Action,
  [int]$Id = 0,
  [string]$Title = '',
  [string]$Ref = '',
  [string]$Description = '',
  [string]$Done = '',
  [int[]]$Depends = @(),
  [int]$ReworkOf = 0,
  [ValidateSet('PASS','FAIL','PARTIAL')][string]$Result,
  [string]$Summary = '',
  [string]$Evidence = ''
)
$ErrorActionPreference = 'Stop'
$Site = 'E:\SLCCRAOP\slccraop-site'
if (-not (Test-Path -LiteralPath $Site)) { throw "Site folder not found: $Site. Complete task L0 first." }
$WLDir = Join-Path $Site 'worklist'
$VLDir = Join-Path $Site 'verifylist'
foreach ($d in $WLDir, $VLDir) { if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d | Out-Null } }

function Get-Stamp { (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss') + ' UTC' }
function Get-WLPath([int]$n) { Join-Path $WLDir ('WL-{0:D4}.txt' -f $n) }
function Get-VLPath([int]$n) { Join-Path $VLDir ('VL-{0:D4}.txt' -f $n) }
function Get-Hash([string]$p) { (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash }

function Get-Field([string]$p, [string]$name) {
  $m = Select-String -LiteralPath $p -Pattern ('^' + [regex]::Escape($name) + ':\s*(.*)$') | Select-Object -First 1
  if ($m) { return $m.Matches[0].Groups[1].Value.Trim() }
  return ''
}

function Get-Nums([string]$dir, [string]$prefix) {
  $nums = @()
  foreach ($f in Get-ChildItem -LiteralPath $dir -Filter "$prefix-*.txt" -File) {
    if ($f.BaseName -match '^[A-Z]+-(\d+)$') { $nums += [int]$Matches[1] }
  }
  return ($nums | Sort-Object)
}

function Get-DepIds([string]$p) {
  $line = Get-Field $p 'Depends on'
  $ids = @()
  foreach ($m in [regex]::Matches($line, '\d+')) { $ids += [int]$m.Value }
  return $ids
}

function Test-Satisfied([int]$n) {
  $vp = Get-VLPath $n
  if (-not (Test-Path -LiteralPath $vp)) { return $false }
  if ((Get-Field $vp 'Result') -eq 'PASS') { return $true }
  $hits = Select-String -Path (Join-Path $WLDir 'WL-*.txt') -Pattern ('^Rework of:\s*WL-{0:D4}' -f $n)
  foreach ($h in $hits) {
    $m = [int]($h.Filename -replace '\D', '')
    if (Test-Satisfied $m) { return $true }
  }
  return $false
}

function Save-Once([string]$p, [string[]]$lines) {
  if (Test-Path -LiteralPath $p) { throw "Refused: $p already exists. These files are write-once." }
  $text = ($lines -join "`r`n") + "`r`n"
  [System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding($false)))
  (Get-Item -LiteralPath $p).IsReadOnly = $true
}

function Invoke-Audit {
  $problems = @()
  $prev = 'GENESIS'
  $i = 0
  foreach ($f in (Get-ChildItem -LiteralPath $WLDir -Filter 'WL-*.txt' -File | Sort-Object Name)) {
    $i++
    if ($f.Name -ne ('WL-{0:D4}.txt' -f $i)) { $problems += "Numbering gap or odd file name near $($f.Name)" }
    if (-not $f.IsReadOnly) { $problems += "$($f.Name) is not read-only" }
    if ((Get-Field $f.FullName 'Previous work item hash') -ne $prev) { $problems += "$($f.Name) breaks the work item chain" }
    $prev = Get-Hash $f.FullName
  }
  $pv = 'GENESIS'
  $j = 0
  $vls = @(Get-ChildItem -LiteralPath $VLDir -Filter 'VL-*.txt' -File | Sort-Object { [int](Get-Field $_.FullName 'Verify sequence') })
  foreach ($f in $vls) {
    $j++
    if (-not $f.IsReadOnly) { $problems += "$($f.Name) is not read-only" }
    if ([int](Get-Field $f.FullName 'Verify sequence') -ne $j) { $problems += "$($f.Name) has a wrong sequence number" }
    if ((Get-Field $f.FullName 'Previous verify hash') -ne $pv) { $problems += "$($f.Name) breaks the verify chain" }
    $pv = Get-Hash $f.FullName
    $n = [int]($f.BaseName -replace '^VL-', '')
    $wp = Get-WLPath $n
    if (-not (Test-Path -LiteralPath $wp)) { $problems += "$($f.Name) has no matching work item" }
    elseif ((Get-Hash $wp) -ne (Get-Field $f.FullName 'Linked work item hash')) { $problems += "WL-{0:D4} was changed after it was verified" -f $n }
  }
  return $problems
}

function Get-Unresolved {
  $out = @()
  foreach ($n in @(Get-Nums $VLDir 'VL')) {
    $r = Get-Field (Get-VLPath $n) 'Result'
    if ($r -ne 'PASS' -and -not (Test-Satisfied $n)) { $out += ('WL-{0:D4} ended {1} and has no passing rework item' -f $n, $r) }
  }
  return $out
}

function Show-Next {
  $wl = @(Get-Nums $WLDir 'WL')
  $vl = @(Get-Nums $VLDir 'VL')
  if ($wl.Count -eq 0) { Write-Host 'NEXT: no work items exist yet. Create the full plan with -Action NewWork.'; return }
  $open = @($wl | Where-Object { $vl -notcontains $_ })
  if ($open.Count -eq 0) { Write-Host 'NEXT: every work item has a verify item. Create new work items if more work is needed.'; return }
  foreach ($n in $open) {
    $ok = $true
    foreach ($d in @(Get-DepIds (Get-WLPath $n))) { if (-not (Test-Satisfied $d)) { $ok = $false } }
    if ($ok) {
      Write-Host ('NEXT: WL-{0:D4}' -f $n)
      Get-Content -LiteralPath (Get-WLPath $n)
      return
    }
  }
  Write-Host 'NEXT: no open item can start because all are blocked by unmet dependencies. Report this to the owner.'
}

switch ($Action) {
  'NewWork' {
    if ($Id -lt 1 -or -not $Title -or -not $Description -or -not $Done) { throw 'NewWork needs -Id, -Title, -Description and -Done.' }
    $have = @(Get-Nums $WLDir 'WL')
    $expected = 1
    if ($have.Count -gt 0) { $expected = ($have | Measure-Object -Maximum).Maximum + 1 }
    if ($Id -ne $expected) { throw "The next work item number must be $expected. No gaps, no reuse." }
    foreach ($d in $Depends) {
      if ($d -ge $Id -or -not (Test-Path -LiteralPath (Get-WLPath $d))) { throw "Invalid dependency WL-$d" }
    }
    if ($ReworkOf -gt 0) {
      $vp = Get-VLPath $ReworkOf
      if (-not (Test-Path -LiteralPath $vp) -or (Get-Field $vp 'Result') -eq 'PASS') { throw "WL-$ReworkOf has no failed verify item, so it cannot be reworked." }
    }
    $prev = 'GENESIS'
    if ($Id -gt 1) { $prev = Get-Hash (Get-WLPath ($Id - 1)) }
    $dep = 'none'
    if ($Depends.Count -gt 0) { $dep = (($Depends | ForEach-Object { 'WL-{0:D4}' -f $_ }) -join ', ') }
    $rw = 'none'
    if ($ReworkOf -gt 0) { $rw = 'WL-{0:D4}' -f $ReworkOf }
    $lines = @(
      ('WORK ITEM: WL-{0:D4}' -f $Id),
      "Created: $(Get-Stamp)",
      "Title: $Title",
      "Reference: $Ref",
      "Depends on: $dep",
      "Rework of: $rw",
      "Previous work item hash: $prev",
      '',
      'Description:',
      $Description,
      '',
      'Definition of done:',
      $Done
    )
    Save-Once (Get-WLPath $Id) $lines
    Write-Host ('Created and locked WL-{0:D4}' -f $Id)
  }
  'NewVerify' {
    if ($Id -lt 1 -or -not $Result -or -not $Summary -or -not $Evidence) { throw 'NewVerify needs -Id, -Result, -Summary and -Evidence.' }
    $wp = Get-WLPath $Id
    $vp = Get-VLPath $Id
    if (-not (Test-Path -LiteralPath $wp)) { throw "WL-$Id does not exist." }
    if (Test-Path -LiteralPath $vp) { throw "A verify item for WL-$Id already exists. Create a rework work item instead." }
    if ($Result -eq 'PASS') {
      foreach ($d in @(Get-DepIds $wp)) { if (-not (Test-Satisfied $d)) { throw "Cannot PASS: dependency WL-$d is not satisfied." } }
    }
    $existing = @(Get-ChildItem -LiteralPath $VLDir -Filter 'VL-*.txt' -File)
    $seq = $existing.Count + 1
    $prev = 'GENESIS'
    if ($existing.Count -gt 0) {
      $last = $existing | Sort-Object { [int](Get-Field $_.FullName 'Verify sequence') } | Select-Object -Last 1
      $prev = Get-Hash $last.FullName
    }
    $lines = @(
      ('VERIFY ITEM: VL-{0:D4}' -f $Id),
      ('Linked work item: WL-{0:D4}' -f $Id),
      "Linked work item hash: $(Get-Hash $wp)",
      "Verify sequence: $seq",
      "Previous verify hash: $prev",
      "Verified: $(Get-Stamp)",
      "Result: $Result",
      '',
      'Summary of work done:',
      $Summary,
      '',
      'Evidence (commands run, outcomes, files created or changed):',
      $Evidence
    )
    Save-Once $vp $lines
    Write-Host ('Created and locked VL-{0:D4} with result {1}' -f $Id, $Result)
  }
  'Next' { Show-Next }
  'Audit' {
    $p = @(Invoke-Audit)
    if ($p.Count -gt 0) { $p | ForEach-Object { Write-Host "AUDIT PROBLEM: $_" -ForegroundColor Red }; exit 1 }
    Write-Host 'AUDIT OK'
  }
  'Status' {
    $wl = @(Get-Nums $WLDir 'WL')
    $vl = @(Get-Nums $VLDir 'VL')
    $pass = 0
    foreach ($n in $vl) { if ((Get-Field (Get-VLPath $n) 'Result') -eq 'PASS') { $pass++ } }
    Write-Host ("Work items: {0}   Verify items: {1}   Passed: {2}" -f $wl.Count, $vl.Count, $pass)
    $p = @(Invoke-Audit)
    if ($p.Count -gt 0) { $p | ForEach-Object { Write-Host "AUDIT PROBLEM: $_" -ForegroundColor Red } } else { Write-Host 'AUDIT OK' }
    foreach ($u in @(Get-Unresolved)) { Write-Host "UNRESOLVED: $u" -ForegroundColor Yellow }
    Show-Next
    if ($p.Count -gt 0) { exit 1 }
  }
}