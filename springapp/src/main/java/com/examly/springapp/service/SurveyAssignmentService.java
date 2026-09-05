package com.examly.springapp.service;
import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.SurveyAssignmentDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.LossNotificationRepository;
import com.examly.springapp.repository.SurveyAssignmentRepository;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class SurveyAssignmentService {
    private final SurveyAssignmentRepository surveyAssignmentRepository;
    private final LossNotificationRepository lossNotificationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    public SurveyAssignmentDTO assignSurveyor(Long notificationId, Long surveyorId, SurveyAssignmentDTO dto) {
        LossNotification notification = lossNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Loss notification not found with ID: " + notificationId));
        User surveyor = userRepository.findById(surveyorId)
                .orElseThrow(() -> new ResourceNotFoundException("Surveyor user not found with ID: " + surveyorId));
        SurveyAssignment assignment = new SurveyAssignment();
        assignment.setNotification(notification);
        assignment.setSurveyor(surveyor);
        assignment.setSurveyDate(dto.getSurveyDate());
        assignment.setStatus(SurveyStatus.ASSIGNED);
        SurveyAssignment saved = surveyAssignmentRepository.save(assignment);
        notification.setStatus(LossStatus.SURVEYOR_ASSIGNED);
        lossNotificationRepository.save(notification);
        auditService.logAction(surveyorId, "SURVEYOR_ASSIGNED", "SURVEY_ASSIGNMENT", saved.getId(),
                "Assigned surveyor to loss notification ID: " + notificationId, "127.0.0.1");
        return convertToDTO(saved);
    }
    public SurveyAssignmentDTO submitSurveyResults(Long id, SurveyAssignmentDTO dto) {
        SurveyAssignment assignment = surveyAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey assignment not found with ID: " + id));

        assignment.setSurveyCompletedAt(LocalDateTime.now());
        assignment.setSurveyGeoLat(dto.getSurveyGeoLat());
        assignment.setSurveyGeoLng(dto.getSurveyGeoLng());
        assignment.setYieldAssessedKgHa(dto.getYieldAssessedKgHa());
        assignment.setLossAssessedPct(dto.getLossAssessedPct());
        assignment.setSurveyPhotos(dto.getSurveyPhotos() != null ? dto.getSurveyPhotos() : "[]");
        assignment.setStatus(SurveyStatus.SUBMITTED);
        SurveyAssignment saved = surveyAssignmentRepository.save(assignment);
        LossNotification notification = assignment.getNotification();
        notification.setStatus(LossStatus.SURVEYED);
        lossNotificationRepository.save(notification);

        auditService.logAction(assignment.getSurveyor().getId(), "SURVEY_SUBMITTED", "SURVEY_ASSIGNMENT", saved.getId(),
                "Submitted ground survey results with loss %: " + saved.getLossAssessedPct(), "127.0.0.1");

        return convertToDTO(saved);
    }

    public List<SurveyAssignmentDTO> getAssignmentsBySurveyor(Long surveyorId) {
        return surveyAssignmentRepository.findBySurveyorId(surveyorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    public List<SurveyAssignmentDTO> getAllAssignments() {
        return surveyAssignmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    public SurveyAssignmentDTO getAssignmentById(Long id) {
        SurveyAssignment assignment = surveyAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey assignment not found with ID: " + id));
        return convertToDTO(assignment);
    }
    public SurveyAssignmentDTO convertToDTO(SurveyAssignment assignment) {
        SurveyAssignmentDTO dto = new SurveyAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setNotificationId(assignment.getNotification().getId());
        dto.setSurveyorId(assignment.getSurveyor().getId());
        dto.setSurveyDate(assignment.getSurveyDate());
        dto.setSurveyCompletedAt(assignment.getSurveyCompletedAt());
        dto.setSurveyGeoLat(assignment.getSurveyGeoLat());
        dto.setSurveyGeoLng(assignment.getSurveyGeoLng());
        dto.setYieldAssessedKgHa(assignment.getYieldAssessedKgHa());
        dto.setLossAssessedPct(assignment.getLossAssessedPct());
        dto.setSurveyPhotos(assignment.getSurveyPhotos());
        dto.setStatus(assignment.getStatus());
        return dto;
    }
}
