$base = "http://localhost:8080/api"

$loginBody = @{ email = "ramesh@farmer.in"; password = "Farmer@123" } | ConvertTo-Json
$farmerLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $farmerLogin.data.token
$headers = @{ "Authorization" = "Bearer $token" }

# 1. Enroll policy
$policyBody = @{
    cropName = "Paddy/Rice"
    season = "KHARIF"
    cropYear = 2026
    sownAreaHa = 3.00
    khasraSurveyNo = "KH-LOSS-$(Get-Random)"
} | ConvertTo-Json
$polRes = Invoke-RestMethod -Uri "$base/policies/enroll/farmer/2" -Method POST -Body $policyBody -ContentType "application/json" -Headers $headers
$polId = $polRes.data.id
Write-Host "Enrolled policy ID: $polId"

# 2. Report loss
$lossBody = @{
    lossType = "Flood / Inundation"
    affectedAreaHa = 2.0
    lossDate = "2026-09-01"
    farmerRemarks = "Flash flood damaged seedlings"
} | ConvertTo-Json

try {
    $lossRes = Invoke-RestMethod -Uri "$base/loss-notifications/policy/$polId" -Method POST -Body $lossBody -ContentType "application/json" -Headers $headers
    Write-Host "Loss success:" ($lossRes | ConvertTo-Json)
} catch {
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error Body:" $reader.ReadToEnd()
}
