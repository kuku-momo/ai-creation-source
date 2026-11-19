# 通过 SSH.NET 连接服务器并执行命令（密码认证，绕开 OpenSSH 不能传密码的限制）
# 用法: .\ssh-run.ps1 -Command 'uname -a'
param(
  [Parameter(Mandatory = $true)][string]$Command,
  [string]$HostIp = 'TARGET_HOST',
  [int]$Port = 22,
  [string]$User = 'root',
  [string]$Password = '__DEPLOY_PASS__',
  [int]$TimeoutSec = 120
)

$ErrorActionPreference = 'Stop'
$dll = 'C:\Users\Administrator\Desktop\AI-Creation-Source\.deploy\sshnet\lib\net8.0\Renci.SshNet.dll'
if (-not (Test-Path $dll)) { throw "缺少 SSH.NET: $dll" }
Add-Type -Path $dll

$ci = New-Object Renci.SshNet.PasswordConnectionInfo($HostIp, $Port, $User, $Password)
$ci.Timeout = [TimeSpan]::FromSeconds(20)
$ssh = New-Object Renci.SshNet.SshClient($ci)
try {
  $ssh.Connect()
  $cmd = $ssh.CreateCommand($Command)
  $cmd.CommandTimeout = [TimeSpan]::FromSeconds($TimeoutSec)
  $out = $cmd.Execute()
  if ($cmd.Error) { [Console]::Error.WriteLine($cmd.Error) }
  Write-Output $out
  Write-Output "__EXIT__=$($cmd.ExitStatus)"
} finally {
  if ($ssh.IsConnected) { $ssh.Disconnect() }
  $ssh.Dispose()
}
