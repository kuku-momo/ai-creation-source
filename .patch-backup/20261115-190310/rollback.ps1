# 授权校验移除补丁 —— 回滚脚本
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File .\rollback.ps1
# 作用：把本目录（.patch-backup\<时间戳>）里的原始文件覆盖回项目，撤销全部改动。

param(
  [string]$ProjectRoot = 'D:\Backup\Downloads\AI-Creation-Source'
)

$ErrorActionPreference = 'Stop'
$backupRoot = $PSScriptRoot
$restored = 0

Get-ChildItem -LiteralPath $backupRoot -Recurse -File -Filter '*.cjs' |
  Where-Object { $_.FullName -notmatch '\\rollback\.ps1$' } |
  ForEach-Object {
    $relative = $_.FullName.Substring($backupRoot.Length).TrimStart('\')
    $target = Join-Path $ProjectRoot $relative
    New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
    Write-Host "restored $relative"
    $restored += 1
  }

Get-ChildItem -LiteralPath $backupRoot -Recurse -File -Filter '*.js' |
  ForEach-Object {
    $relative = $_.FullName.Substring($backupRoot.Length).TrimStart('\')
    $target = Join-Path $ProjectRoot $relative
    New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
    Write-Host "restored $relative"
    $restored += 1
  }

Write-Host "回滚完成：$restored 个文件已还原到 $ProjectRoot"
