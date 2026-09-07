param(
  [Parameter(Mandatory = $true)]
  [string]$ClientId,

  [Parameter(Mandatory = $true)]
  [string]$ClientSecret,

  [Parameter(Mandatory = $true)]
  [string]$RefreshToken,

  [Parameter(Mandatory = $false)]
  [string]$AccountsBase = "https://accounts.zoho.com"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$uri = ($AccountsBase.TrimEnd("/") + "/oauth/v2/token")

$response = Invoke-RestMethod -Method Post -Uri $uri `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    grant_type    = "refresh_token"
    client_id     = $ClientId
    client_secret = $ClientSecret
    refresh_token = $RefreshToken
  }

$response | ConvertTo-Json -Depth 10

