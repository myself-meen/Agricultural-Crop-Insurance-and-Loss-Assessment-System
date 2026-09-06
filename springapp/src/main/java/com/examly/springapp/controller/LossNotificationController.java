package com.examly.springapp.controller;

import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.LossNotificationDTO;
import com.examly.springapp.service.LossNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loss-notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LossNotificationController {

    private final LossNotificationService lossNotificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<LossNotificationDTO>> reportLossDirect(
            @Valid @RequestBody LossNotificationDTO dto) {
        Long policyId = dto.getPolicyId();
        if (policyId == null) {
            throw new IllegalArgumentException("policyId is required in request body");
        }
        LossNotificationDTO response = lossNotificationService.reportLoss(policyId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Loss notification reported successfully", response));
    }

    @PostMapping("/policy/{policyId}")
    public ResponseEntity<ApiResponse<LossNotificationDTO>> reportLoss(
            @PathVariable Long policyId,
            @Valid @RequestBody LossNotificationDTO dto) {
        LossNotificationDTO response = lossNotificationService.reportLoss(policyId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Loss notification reported successfully", response));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<List<LossNotificationDTO>>> getLossNotificationsByFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Farmer loss notifications fetched successfully", lossNotificationService.getLossNotificationsByFarmer(farmerId)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<LossNotificationDTO>>> getLossNotificationsByStatus(@PathVariable com.examly.springapp.entity.LossStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Loss notifications filtered by status", lossNotificationService.getLossNotificationsByStatus(status)));
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<ApiResponse<List<LossNotificationDTO>>> getLossNotificationsByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Loss notifications fetched successfully", lossNotificationService.getLossNotificationsByPolicy(policyId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LossNotificationDTO>>> getAllLossNotifications() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All loss notifications fetched successfully", lossNotificationService.getAllLossNotifications()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LossNotificationDTO>> getLossNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Loss notification fetched successfully", lossNotificationService.getLossNotificationById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLossNotification(@PathVariable Long id) {
        lossNotificationService.deleteLossNotification(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Loss notification withdrawn and deleted successfully", null));
    }
}
