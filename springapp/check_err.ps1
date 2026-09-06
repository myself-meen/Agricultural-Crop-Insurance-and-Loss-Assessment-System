$base = "http://localhost:8080/api"

$loginBody = @{ email = "ramesh@farmer.in"; password = "Farmer@123" } | ConvertTo-Json
$farmerLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $farmerLogin.data.token
$headers = @{ "Authorization" = "Bearer $token" }

# Generate 12-digit number
$randAadhaar = "88" + (Get-Random -Minimum 1000000000 -Maximum 9999999999)

$body = @{
    aadhaarNumber = $randAadhaar
    bankAccountNo = "123456789012"
    ifscCode = "SBIN0001234"
    bankName = "State Bank of India"
    district = "Chennai"
    state = "Tamil Nadu"
    pincode = "600001"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$base/farmer-profiles/user/2" -Method POST -Body $body -ContentType "application/json" -Headers $headers
    Write-Host "Success:" ($res | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error Body:" $reader.ReadToEnd()
}
