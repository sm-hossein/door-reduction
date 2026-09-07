param(
  [Parameter(Mandatory = $true)]
  [string]$ClientId,

  [Parameter(Mandatory = $true)]
  [string]$ClientSecret,

  [Parameter(Mandatory = $true)]
  [string]$GrantCode,

  [Parameter(Mandatory = $false)]
  [string]$AccountsBase = "https://accounts.zoho.com",

  [Parameter(Mandatory = $false)]
  [string]$RedirectUri
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$uri = ($AccountsBase.TrimEnd("/") + "/oauth/v2/token")

$body = @{
  grant_type    = "authorization_code"
  client_id     = $ClientId
  client_secret = $ClientSecret
  code          = $GrantCode
}

# Some Zoho setups require redirect_uri for code exchange; include only when provided.
if ($RedirectUri) {
  $body.redirect_uri = $RedirectUri
}

$response = Invoke-RestMethod -Method Post -Uri $uri `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $body

$response | ConvertTo-Json -Depth 10

