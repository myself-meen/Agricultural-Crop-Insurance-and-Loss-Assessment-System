package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.LossNotificationDTO;
import com.examly.springapp.entity.LossNotification;
import com.examly.springapp.entity.LossStatus;
import com.examly.springapp.entity.Policy;
import com.examly.springapp.entity.PolicyStatus;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.LossNotificationRepository;
import com.examly.springapp.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LossNotificationService {

    private final LossNotificationRepository lossNotificationRepository;
    private final PolicyRepository policyRepository;
    private final AuditService auditService;

    public LossNotificationDTO reportLoss(Long policyId, LossNotificationDTO dto) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));

        LossNotification notification = new LossNotification();
        notification.setPolicy(policy);
        notification.setLossType(dto.getLossType());
        notification.setAffectedAreaHa(dto.getAffectedAreaHa());
        notification.setLossDate(dto.getLossDate() != null ? dto.getLossDate() : LocalDateTime.now());
        notification.setNotificationDate(LocalDateTime.now());
        notification.setGeoLat(dto.getGeoLat());
        notification.setGeoLng(dto.getGeoLng());
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

    public LossNotificationDTO convertToDTO(LossNotification notification) {
        LossNotificationDTO dto = new LossNotificationDTO();
        dto.setId(notification.getId());
        dto.setPolicyId(notification.getPolicy().getId());
        dto.setLossType(notification.getLossType());
        dto.setAffectedAreaHa(notification.getAffectedAreaHa());
        dto.setLossDate(notification.getLossDate());
        dto.setNotificationDate(notification.getNotificationDate());
        dto.setGeoLat(notification.getGeoLat());
        dto.setGeoLng(notification.getGeoLng());
        dto.setSatelliteNdviScore(notification.getSatelliteNdviScore());
        dto.setPhotoUrls(notification.getPhotoUrls());
        dto.setStatus(notification.getStatus());
        return dto;
    }
}
