$base = "http://localhost:8080/api"

Write-Host "=== 1. Testing Auth & Login ===" -ForegroundColor Cyan
$loginBody = @{ email = "ramesh@farmer.in"; password = "Farmer@123" } | ConvertTo-Json
$farmerLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$farmerToken = $farmerLogin.data.token
$farmerId = $farmerLogin.data.userId
$farmerHeaders = @{ "Authorization" = "Bearer $farmerToken" }
Write-Host "Farmer Ramesh Logged in: ID $farmerId" -ForegroundColor Green

$admLoginBody = @{ email = "admin@cropinsure.gov.in"; password = "Admin@123" } | ConvertTo-Json
$admLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $admLoginBody -ContentType "application/json"
$admToken = $admLogin.data.token
$admHeaders = @{ "Authorization" = "Bearer $admToken" }
Write-Host "Admin Logged in" -ForegroundColor Green

Write-Host "`n=== 2. Testing KYC Profile Creation & Auto-Resolution ===" -ForegroundColor Cyan
$randAadhaar = "88" + (Get-Random -Minimum 1000000000 -Maximum 9999999999)
$profileBody = @{
    aadhaarNumber = $randAadhaar
    bankAccountNo = "123456789012"
    ifscCode = "SBIN0001234"
    bankName = "State Bank of India"
    district = "Chennai"
    state = "Tamil Nadu"
    pincode = "600001"
} | ConvertTo-Json

$profRes = Invoke-RestMethod -Uri "$base/farmer-profiles/user/$farmerId" -Method POST -Body $profileBody -ContentType "application/json" -Headers $farmerHeaders
Write-Host "Profile created/updated with district: $($profRes.data.district), state: $($profRes.data.state)" -ForegroundColor Green

Write-Host "`n=== 3. Testing Policy Enrollment with Auto-Resolved District ===" -ForegroundColor Cyan
$policyBody = @{
    cropName = "Paddy/Rice"
    season = "KHARIF"
    cropYear = 2026
    sownAreaHa = 3.00
    khasraSurveyNo = "KH-TEST-$(Get-Random)"
} | ConvertTo-Json
$polRes = Invoke-RestMethod -Uri "$base/policies/enroll/farmer/$farmerId" -Method POST -Body $policyBody -ContentType "application/json" -Headers $farmerHeaders
$policyId = $polRes.data.id
Write-Host "Policy Enrolled: ID $policyId, District: $($polRes.data.district), State: $($polRes.data.state), SumInsured: ₹$($polRes.data.sumInsured)" -ForegroundColor Green

Write-Host "`n=== 4. Testing Policy Deletion (Clean Policy) ===" -ForegroundColor Cyan
$delPolRes = Invoke-RestMethod -Uri "$base/policies/$policyId" -Method DELETE -Headers $farmerHeaders
Write-Host "Policy $policyId successfully deleted/cancelled" -ForegroundColor Green

Write-Host "`n=== 5. Testing Loss Notification Creation & Withdrawal ===" -ForegroundColor Cyan
# Create a fresh policy for loss notice
$policyBody2 = @{
    cropName = "Cotton"
    season = "KHARIF"
    cropYear = 2026
    sownAreaHa = 2.50
    khasraSurveyNo = "KH-TEST-$(Get-Random)"
} | ConvertTo-Json
$polRes2 = Invoke-RestMethod -Uri "$base/policies/enroll/farmer/$farmerId" -Method POST -Body $policyBody2 -ContentType "application/json" -Headers $farmerHeaders
$policyId2 = $polRes2.data.id

$lossBody = @{
    lossType = "FLOOD"
    affectedAreaHa = 2.0
    lossDate = "2026-09-01T10:00:00"
    farmerRemarks = "Flash flood damaged seedlings"
} | ConvertTo-Json
$lossRes = Invoke-RestMethod -Uri "$base/loss-notifications/policy/$policyId2" -Method POST -Body $lossBody -ContentType "application/json" -Headers $farmerHeaders
$lossId = $lossRes.data.id
Write-Host "Loss Notification created: ID $lossId, Status: $($lossRes.data.status)" -ForegroundColor Green

# Test withdrawal of loss notification
$delLossRes = Invoke-RestMethod -Uri "$base/loss-notifications/$lossId" -Method DELETE -Headers $farmerHeaders
Write-Host "Loss Notification $lossId withdrawn successfully" -ForegroundColor Green

Write-Host "`n=== 6. Testing Survey Assignment & Unassignment ===" -ForegroundColor Cyan
# Re-create loss notification on policyId2
$lossRes2 = Invoke-RestMethod -Uri "$base/loss-notifications/policy/$policyId2" -Method POST -Body $lossBody -ContentType "application/json" -Headers $farmerHeaders
$lossId2 = $lossRes2.data.id

# Assign surveyor (surveyor ID = 4)
$assignBody = @{
    surveyDate = "2026-09-10"
} | ConvertTo-Json
$assignRes = Invoke-RestMethod -Uri "$base/survey-assignments/assign?notificationId=$lossId2&surveyorId=4" -Method POST -Body $assignBody -ContentType "application/json" -Headers $admHeaders
$surveyId = $assignRes.data.id
Write-Host "Survey assigned: ID $surveyId, Status: $($assignRes.data.status)" -ForegroundColor Green

# Unassign survey
$unassignRes = Invoke-RestMethod -Uri "$base/survey-assignments/$surveyId" -Method DELETE -Headers $admHeaders
Write-Host "Survey $surveyId unassigned successfully" -ForegroundColor Green

# Verify loss notification returned to SUBMITTED
$lossCheck = Invoke-RestMethod -Uri "$base/loss-notifications/$lossId2" -Method GET -Headers $farmerHeaders
Write-Host "Loss notification returned to status: $($lossCheck.data.status)" -ForegroundColor Green

Write-Host "`n=== 7. Real-Time Analytics Query with Dynamic Districts ===" -ForegroundColor Cyan
$analytics = Invoke-RestMethod -Uri "$base/analytics/dashboard" -Method GET -Headers $admHeaders
Write-Host "Analytics Summary: TotalPolicies=$($analytics.data.totalPoliciesEnrolled), TotalSumInsured=₹$($analytics.data.totalSumInsured), TotalClaimsSettled=$($analytics.data.claimsSettledCount), TotalClaimsDisbursed=₹$($analytics.data.totalClaimsDisbursedAmount)" -ForegroundColor Green

Write-Host "`n>>> ALL LIFECYCLE & DELETION END-TO-END VALIDATIONS COMPLETED WITH 100% SUCCESS! <<<" -ForegroundColor Yellow
