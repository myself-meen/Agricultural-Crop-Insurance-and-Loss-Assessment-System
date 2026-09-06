$base = "http://localhost:8080/api"

$loginBody = @{ email = "ramesh@farmer.in"; password = "Farmer@123" } | ConvertTo-Json
$farmerLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $farmerLogin.data.token
$headers = @{ "Authorization" = "Bearer $token" }

$policyBody = @{
    cropName = "Paddy/Rice"
    season = "KHARIF"
    cropYear = 2026
    sownAreaHa = 3.00
    khasraSurveyNo = "KH-TEST-$(Get-Random)"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$base/policies/farmer/2" -Method POST -Body $policyBody -ContentType "application/json" -Headers $headers
    Write-Host "Success:" ($res | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error Body:" $reader.ReadToEnd()
}
