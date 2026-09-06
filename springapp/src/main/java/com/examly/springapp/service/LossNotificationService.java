package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.LossNotificationDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.LossNotificationRepository;
import com.examly.springapp.repository.PolicyRepository;
import com.examly.springapp.repository.SurveyAssignmentRepository;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LossNotificationService {

    private final LossNotificationRepository lossNotificationRepository;
    private final PolicyRepository policyRepository;
    private final SurveyAssignmentRepository surveyAssignmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public LossNotificationDTO reportLoss(Long policyId, LossNotificationDTO dto) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));

        LossNotification notification = new LossNotification();
        notification.setPolicy(policy);
        notification.setLossType(dto.getLossType());
        notification.setAffectedAreaHa(dto.getAffectedAreaHa() != null ? dto.getAffectedAreaHa() : policy.getSownAreaHa());
        notification.setLossDate(dto.getLossDate() != null ? dto.getLossDate() : LocalDateTime.now());
        notification.setNotificationDate(LocalDateTime.now());
        notification.setGeoLat(dto.getGeoLat() != null ? dto.getGeoLat() : new BigDecimal("23.259933"));
        notification.setGeoLng(dto.getGeoLng() != null ? dto.getGeoLng() : new BigDecimal("77.412615"));

        // Mock satellite NDVI calculation if not provided
        notification.setSatelliteNdviScore(dto.getSatelliteNdviScore() != null ? dto.getSatelliteNdviScore() : new BigDecimal("0.42"));
        notification.setPhotoUrls(dto.getPhotoUrls() != null ? dto.getPhotoUrls() : "[]");
        notification.setStatus(LossStatus.SUBMITTED);

        LossNotification saved = lossNotificationRepository.save(notification);

        // Update policy status to CLAIM_FILED
        policy.setStatus(PolicyStatus.CLAIM_FILED);
        policyRepository.save(policy);

        auditService.logAction(policy.getFarmer().getId(), "LOSS_NOTIFICATION_SUBMITTED", "LOSS_NOTIFICATION", saved.getId(),
                "Reported loss of type: " + saved.getLossType() + " for policy ID: " + policyId, "127.0.0.1");

        return convertToDTO(saved);
    }

    public List<LossNotificationDTO> getLossNotificationsByFarmer(Long farmerId) {
        List<Policy> policies = policyRepository.findByFarmerId(farmerId);
        return policies.stream()
                .flatMap(p -> lossNotificationRepository.findByPolicyId(p.getId()).stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LossNotificationDTO> getLossNotificationsByStatus(LossStatus status) {
        return lossNotificationRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LossNotificationDTO> getLossNotificationsByPolicy(Long policyId) {
        return lossNotificationRepository.findByPolicyId(policyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LossNotificationDTO> getAllLossNotifications() {
        return lossNotificationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LossNotificationDTO getLossNotificationById(Long id) {
        LossNotification notification = lossNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loss notification not found with ID: " + id));
        return convertToDTO(notification);
    }

    public void deleteLossNotification(Long id) {
        LossNotification notification = lossNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loss notification not found with ID: " + id));

        if (notification.getStatus() != LossStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot delete loss notification in status: " + notification.getStatus() + ". Only unassigned (SUBMITTED) notifications can be withdrawn.");
        }

        Long farmerId = (notification.getPolicy() != null && notification.getPolicy().getFarmer() != null)
                ? notification.getPolicy().getFarmer().getId() : 1L;

        Policy policy = notification.getPolicy();
        if (policy != null) {
            policy.setStatus(PolicyStatus.ACTIVE);
            policyRepository.save(policy);
        }

        lossNotificationRepository.delete(notification);
        auditService.logAction(farmerId, "LOSS_NOTIFICATION_WITHDRAWN", "LOSS_NOTIFICATION", id,
                "Withdrawn loss notification ID: " + id, "127.0.0.1");
    }

    public LossNotificationDTO convertToDTO(LossNotification notification) {
        LossNotificationDTO dto = new LossNotificationDTO();
        dto.setId(notification.getId());
        if (notification.getPolicy() != null) {
            dto.setPolicyId(notification.getPolicy().getId());
            dto.setCropName(notification.getPolicy().getCropName());
            dto.setDistrict(notification.getPolicy().getDistrict());
            dto.setState(notification.getPolicy().getState());
            if (notification.getPolicy().getFarmer() != null) {
                dto.setFarmerId(notification.getPolicy().getFarmer().getId());
                dto.setFarmerName(notification.getPolicy().getFarmer().getName());
            }
        }
        dto.setLossType(notification.getLossType());
        dto.setAffectedAreaHa(notification.getAffectedAreaHa());
        dto.setLossDate(notification.getLossDate());
        dto.setNotificationDate(notification.getNotificationDate());
        dto.setGeoLat(notification.getGeoLat());
        dto.setGeoLng(notification.getGeoLng());
        dto.setSatelliteNdviScore(notification.getSatelliteNdviScore());
        dto.setPhotoUrls(notification.getPhotoUrls());
        dto.setStatus(notification.getStatus());

        // Check if there is an associated survey assignment
        try {
            surveyAssignmentRepository.findByNotificationId(notification.getId()).ifPresent(survey -> {
                dto.setSurveyId(survey.getId());
                dto.setSurveyStatus(survey.getStatus().name());
                dto.setLossAssessedPct(survey.getLossAssessedPct());
            });
        } catch (Exception ignored) {}

        return dto;
    }
}
