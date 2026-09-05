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
            @RequestParam Long notificationId,
            @RequestParam Long surveyorId,
            @RequestBody SurveyAssignmentDTO dto) {
        SurveyAssignmentDTO response = surveyAssignmentService.assignSurveyor(notificationId, surveyorId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Surveyor assigned successfully", response));
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
}
