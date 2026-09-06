package com.examly.springapp.controller;

import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.SurveyAssignmentDTO;
import com.examly.springapp.service.SurveyAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/survey-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SurveyAssignmentController {

    private final SurveyAssignmentService surveyAssignmentService;

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<SurveyAssignmentDTO>> assignSurveyor(
            @RequestParam(required = false) Long notificationId,
            @RequestParam(required = false) Long surveyorId,
            @RequestBody(required = false) SurveyAssignmentDTO dto) {
        Long notifId = notificationId != null ? notificationId : (dto != null ? dto.getNotificationId() : null);
        Long survId = surveyorId != null ? surveyorId : (dto != null ? dto.getSurveyorId() : null);
        if (notifId == null || survId == null) {
            throw new IllegalArgumentException("Both notificationId and surveyorId are required to assign a surveyor");
        }
        SurveyAssignmentDTO response = surveyAssignmentService.assignSurveyor(notifId, survId, dto != null ? dto : new SurveyAssignmentDTO());
        return ResponseEntity.ok(new ApiResponse<>(true, "Surveyor assigned successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SurveyAssignmentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam com.examly.springapp.entity.SurveyStatus status) {
        SurveyAssignmentDTO response = surveyAssignmentService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Survey status updated successfully", response));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SurveyAssignmentDTO>> submitSurveyResults(
            @PathVariable Long id,
            @RequestBody SurveyAssignmentDTO dto) {
        SurveyAssignmentDTO response = surveyAssignmentService.submitSurveyResults(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Survey results submitted successfully", response));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SurveyAssignmentDTO>>> getAssignmentsByStatus(@PathVariable com.examly.springapp.entity.SurveyStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Survey assignments filtered by status", surveyAssignmentService.getAssignmentsByStatus(status)));
    }

    @GetMapping("/notification/{notificationId}")
    public ResponseEntity<ApiResponse<SurveyAssignmentDTO>> getAssignmentByNotificationId(@PathVariable Long notificationId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Survey assignment fetched by notification ID", surveyAssignmentService.getAssignmentByNotificationId(notificationId)));
    }

    @GetMapping("/surveyor/{surveyorId}")
    public ResponseEntity<ApiResponse<List<SurveyAssignmentDTO>>> getAssignmentsBySurveyor(@PathVariable Long surveyorId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignments fetched successfully", surveyAssignmentService.getAssignmentsBySurveyor(surveyorId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SurveyAssignmentDTO>>> getAllAssignments() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All survey assignments fetched successfully", surveyAssignmentService.getAllAssignments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SurveyAssignmentDTO>> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Survey assignment fetched successfully", surveyAssignmentService.getAssignmentById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        surveyAssignmentService.deleteAssignment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Surveyor unassigned and notification reverted to submitted", null));
    }
}
