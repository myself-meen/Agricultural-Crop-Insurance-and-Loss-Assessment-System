$base = "http://localhost:8080/api"

$loginBody = @{ email = "ramesh@farmer.in"; password = "Farmer@123" } | ConvertTo-Json
$farmerLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $farmerLogin.data.token
$headers = @{ "Authorization" = "Bearer $token" }

# Enroll a policy
$policyBody = @{
    cropName = "Paddy/Rice"
    season = "KHARIF"
    cropYear = 2026
    sownAreaHa = 3.00
    khasraSurveyNo = "KH-DEL-$(Get-Random)"
} | ConvertTo-Json
$polRes = Invoke-RestMethod -Uri "$base/policies/enroll/farmer/2" -Method POST -Body $policyBody -ContentType "application/json" -Headers $headers
$id = $polRes.data.id
Write-Host "Enrolled policy ID: $id"

try {
    $del = Invoke-RestMethod -Uri "$base/policies/$id" -Method DELETE -Headers $headers
    Write-Host "Delete response:" ($del | ConvertTo-Json)
} catch {
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error Body:" $reader.ReadToEnd()
}
