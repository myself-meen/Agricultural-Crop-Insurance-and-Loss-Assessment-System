package com.examly.springapp.controller;

import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.PolicyDTO;
import com.examly.springapp.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping
    public ResponseEntity<ApiResponse<PolicyDTO>> createPolicy(
            @RequestParam(required = false) Long enrolledById,
            @Valid @RequestBody PolicyDTO dto) {
        Long farmerId = dto.getFarmerId();
        if (farmerId == null) {
            throw new IllegalArgumentException("farmerId is required in request body");
        }
        PolicyDTO response = policyService.enrollPolicy(farmerId, dto, enrolledById);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy enrolled successfully", response));
    }

    @PostMapping("/enroll/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<PolicyDTO>> enrollPolicy(
            @PathVariable Long farmerId,
            @RequestParam(required = false) Long enrolledById,
            @Valid @RequestBody PolicyDTO dto) {
        PolicyDTO response = policyService.enrollPolicy(farmerId, dto, enrolledById);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy enrolled successfully", response));
    }

    @PostMapping("/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<PolicyDTO>> enrollPolicyByFarmer(
            @PathVariable Long farmerId,
            @RequestParam(required = false) Long enrolledById,
            @Valid @RequestBody PolicyDTO dto) {
        PolicyDTO response = policyService.enrollPolicy(farmerId, dto, enrolledById);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy enrolled successfully", response));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<List<PolicyDTO>>> getPoliciesByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Farmer policies fetched successfully", policyService.getPoliciesByFarmer(farmerId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PolicyDTO>>> getAllPolicies() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All policies fetched successfully", policyService.getAllPolicies()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PolicyDTO>>> getPoliciesByStatus(@PathVariable com.examly.springapp.entity.PolicyStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Policies filtered by status", policyService.getPoliciesByStatus(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyDTO>> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy fetched successfully", policyService.getPolicyById(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PolicyDTO>> updatePolicyStatus(
            @PathVariable Long id,
            @RequestParam com.examly.springapp.entity.PolicyStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy status updated successfully", policyService.updatePolicyStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy cancelled and deleted successfully", null));
    }
}
