package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.LossNotificationDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.LossNotificationRepository;
import com.examly.springapp.repository.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LossNotificationServiceTest {

    @Mock
    private LossNotificationRepository lossNotificationRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private LossNotificationService lossNotificationService;

    private Policy policy;
    private LossNotificationDTO lossDTO;
    private LossNotification savedNotification;

    @BeforeEach
    void setUp() {
        User farmer = new User();
        farmer.setId(1L);
        farmer.setName("Ramesh");

        policy = new Policy();
        policy.setId(10L);
        policy.setFarmer(farmer);
        policy.setStatus(PolicyStatus.ENROLLED);

        lossDTO = new LossNotificationDTO();
        lossDTO.setPolicyId(10L);
        lossDTO.setLossType(LossType.FLOOD);
        lossDTO.setAffectedAreaHa(new BigDecimal("1.50"));
        lossDTO.setLossDate(LocalDateTime.now().minusHours(24));
        lossDTO.setGeoLat(new BigDecimal("18.5204"));
        lossDTO.setGeoLng(new BigDecimal("73.8567"));

        savedNotification = new LossNotification();
        savedNotification.setId(100L);
        savedNotification.setPolicy(policy);
        savedNotification.setLossType(LossType.FLOOD);
        savedNotification.setAffectedAreaHa(new BigDecimal("1.50"));
        savedNotification.setLossDate(LocalDateTime.now().minusHours(24));
        savedNotification.setGeoLat(new BigDecimal("18.5204"));
        savedNotification.setGeoLng(new BigDecimal("73.8567"));
        savedNotification.setStatus(LossStatus.SUBMITTED);
    }

    @Test
    void testReportLossSuccess() {
        when(policyRepository.findById(10L)).thenReturn(Optional.of(policy));
        when(lossNotificationRepository.save(any(LossNotification.class))).thenReturn(savedNotification);

        LossNotificationDTO result = lossNotificationService.reportLoss(10L, lossDTO);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(LossType.FLOOD, result.getLossType());
        assertEquals(LossStatus.SUBMITTED, result.getStatus());
        verify(policyRepository, times(1)).save(policy);
        assertEquals(PolicyStatus.CLAIM_FILED, policy.getStatus());
    }

    @Test
    void testReportLossPolicyNotFound() {
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> lossNotificationService.reportLoss(99L, lossDTO));
    }

    @Test
    void testGetLossNotificationsByPolicy() {
        when(lossNotificationRepository.findByPolicyId(10L)).thenReturn(List.of(savedNotification));

        List<LossNotificationDTO> results = lossNotificationService.getLossNotificationsByPolicy(10L);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getId());
    }

    @Test
    void testGetLossNotificationById() {
        when(lossNotificationRepository.findById(100L)).thenReturn(Optional.of(savedNotification));

        LossNotificationDTO result = lossNotificationService.getLossNotificationById(100L);
        assertNotNull(result);
        assertEquals(100L, result.getId());
    }
}
