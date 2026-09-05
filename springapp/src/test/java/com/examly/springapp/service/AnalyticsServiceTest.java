package com.examly.springapp.service;

import com.examly.springapp.dto.AnalyticsDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private LossNotificationRepository lossNotificationRepository;

    @Mock
    private SurveyAssignmentRepository surveyAssignmentRepository;

    @Mock
    private ClaimRepository claimRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void testGetDashboardAnalytics() {
        User farmer = new User();
        farmer.setRole(Role.FARMER);
        when(userRepository.findByRole(Role.FARMER)).thenReturn(List.of(farmer));

        Policy policy = new Policy();
        policy.setSumInsured(new BigDecimal("100000.00"));
        policy.setPremiumFarmer(new BigDecimal("2000.00"));
        policy.setPremiumState(new BigDecimal("4000.00"));
        policy.setPremiumCentre(new BigDecimal("4000.00"));
        policy.setSeason(Season.KHARIF);
        when(policyRepository.findAll()).thenReturn(List.of(policy));

        LossNotification notification = new LossNotification();
        notification.setLossType(LossType.DROUGHT);
        when(lossNotificationRepository.findAll()).thenReturn(List.of(notification));

        SurveyAssignment survey = new SurveyAssignment();
        survey.setStatus(SurveyStatus.SUBMITTED);
        when(surveyAssignmentRepository.findAll()).thenReturn(List.of(survey));

        Claim claim = new Claim();
        claim.setStatus(ClaimStatus.PAID);
        claim.setApprovedAmount(new BigDecimal("50000.00"));
        when(claimRepository.findAll()).thenReturn(List.of(claim));

        AnalyticsDTO analytics = analyticsService.getDashboardAnalytics();

        assertNotNull(analytics);
        assertEquals(1, analytics.getTotalFarmers());
        assertEquals(1, analytics.getTotalPolicies());
        assertEquals(new BigDecimal("100000.00"), analytics.getTotalSumInsured());
        assertEquals(new BigDecimal("2000.00"), analytics.getTotalFarmerPremium());
        assertEquals(new BigDecimal("8000.00"), analytics.getTotalSubsidyAmount());
        assertEquals(1, analytics.getTotalLossNotifications());
        assertEquals(1, analytics.getTotalSurveysCompleted());
        assertEquals(1, analytics.getTotalClaims());
        assertEquals(1, analytics.getTotalClaimsPaid());
        assertEquals(new BigDecimal("50000.00"), analytics.getTotalDisbursedAmount());
        assertTrue(analytics.getLossByType().containsKey("DROUGHT"));
        assertTrue(analytics.getClaimsByStatus().containsKey("PAID"));
        assertTrue(analytics.getPoliciesBySeason().containsKey("KHARIF"));
    }
}
