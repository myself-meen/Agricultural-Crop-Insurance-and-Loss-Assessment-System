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

    @PostMapping("/enroll/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<PolicyDTO>> enrollPolicy(
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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyDTO>> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy fetched successfully", policyService.getPolicyById(id)));
    }
}
