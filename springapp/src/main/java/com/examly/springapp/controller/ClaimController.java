package com.examly.springapp.controller;
import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.ClaimDTO;
import com.examly.springapp.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<ClaimDTO>> initiateClaim(@RequestParam Long surveyId) {
        ClaimDTO response = claimService.initiateClaim(surveyId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim initiated successfully", response));
    }

    @PutMapping("/{id}/approve-l1")
    public ResponseEntity<ApiResponse<ClaimDTO>> level1Approve(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestParam(required = false) String remarks) {
        ClaimDTO response = claimService.level1Approve(id, officerId, remarks);
        return ResponseEntity.ok(new ApiResponse<>(true, "Level 1 approval completed", response));
    }

    @PutMapping("/{id}/approve-l2")
    public ResponseEntity<ApiResponse<ClaimDTO>> level2Approve(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestParam(required = false) String remarks) {
        ClaimDTO response = claimService.level2Approve(id, officerId, remarks);
        return ResponseEntity.ok(new ApiResponse<>(true, "Level 2 approval completed", response));
    }

    @PutMapping("/{id}/disburse")
    public ResponseEntity<ApiResponse<ClaimDTO>> disburseDbt(@PathVariable Long id) {
        ClaimDTO response = claimService.disburseDbt(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Direct Benefit Transfer payout disbursed", response));
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<ApiResponse<List<ClaimDTO>>> getClaimsByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy claims fetched successfully", claimService.getClaimsByPolicy(policyId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimDTO>>> getAllClaims() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All claims fetched successfully", claimService.getAllClaims()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClaimDTO>> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim fetched successfully", claimService.getClaimById(id)));
    }
}
