package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.ClaimDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.DuplicateClaimException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private SurveyAssignmentRepository surveyAssignmentRepository;

    @Mock
    private LossNotificationRepository lossNotificationRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ClaimService claimService;


    private User farmer;
    private User officer;
    private Policy policy;
    private LossNotification notification;
    private SurveyAssignment survey;
    private FarmerProfile profile;
    private Claim savedClaim;

    @BeforeEach
    void setUp() {
        farmer = new User();
        farmer.setId(1L);
        farmer.setName("Ramesh");

        officer = new User();
        officer.setId(3L);
        officer.setName("Officer Rajesh");

        policy = new Policy();
        policy.setId(10L);
        policy.setFarmer(farmer);
        policy.setSumInsured(new BigDecimal("100000.00"));
        policy.setStatus(PolicyStatus.CLAIM_FILED);

        notification = new LossNotification();
        notification.setId(100L);
        notification.setPolicy(policy);

        survey = new SurveyAssignment();
        survey.setId(50L);
        survey.setNotification(notification);
        survey.setLossAssessedPct(new BigDecimal("50.00"));

        profile = new FarmerProfile();
        profile.setId(1L);
        profile.setUser(farmer);
        profile.setBankAccountNo("123456789012");
        profile.setIfscCode("SBIN0001234");

        savedClaim = new Claim();
        savedClaim.setId(200L);
        savedClaim.setPolicy(policy);
        savedClaim.setSurvey(survey);
        savedClaim.setClaimedAmount(new BigDecimal("50000.00"));
        savedClaim.setApprovedAmount(new BigDecimal("50000.00"));
        savedClaim.setDbtBankAccount("123456789012");
        savedClaim.setDbtIfsc("SBIN0001234");
        savedClaim.setStatus(ClaimStatus.INITIATED);
    }

    @Test
    void testInitiateClaimSuccess() {
        when(surveyAssignmentRepository.findById(50L)).thenReturn(Optional.of(survey));
        when(claimRepository.findBySurveyId(50L)).thenReturn(Optional.empty());
        when(farmerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimDTO result = claimService.initiateClaim(50L);

        assertNotNull(result);
        assertEquals(200L, result.getId());
        assertEquals(new BigDecimal("50000.00"), result.getClaimedAmount());
        assertEquals(ClaimStatus.INITIATED, result.getStatus());
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    void testInitiateClaimDuplicateThrowsException() {
        when(surveyAssignmentRepository.findById(50L)).thenReturn(Optional.of(survey));
        when(claimRepository.findBySurveyId(50L)).thenReturn(Optional.of(savedClaim));

        assertThrows(DuplicateClaimException.class, () -> claimService.initiateClaim(50L));
    }

    @Test
    void testLevel1Approve() {
        when(claimRepository.findById(200L)).thenReturn(Optional.of(savedClaim));
        when(userRepository.findById(3L)).thenReturn(Optional.of(officer));
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimDTO result = claimService.level1Approve(200L, 3L, "L1 Approved");

        assertNotNull(result);
        assertEquals(ClaimStatus.LEVEL1_APPROVED, savedClaim.getStatus());
        assertEquals(officer, savedClaim.getLevel1Approver());
    }

    @Test
    void testLevel2Approve() {
        when(claimRepository.findById(200L)).thenReturn(Optional.of(savedClaim));
        when(userRepository.findById(3L)).thenReturn(Optional.of(officer));
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimDTO result = claimService.level2Approve(200L, 3L, "L2 Final Approval");

        assertNotNull(result);
        assertEquals(ClaimStatus.APPROVED, savedClaim.getStatus());
        assertEquals(officer, savedClaim.getLevel2Approver());
    }

    @Test
    void testDisburseDbt() {
        when(claimRepository.findById(200L)).thenReturn(Optional.of(savedClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimDTO result = claimService.disburseDbt(200L);

        assertNotNull(result);
        assertEquals(ClaimStatus.PAID, savedClaim.getStatus());
        assertNotNull(savedClaim.getDbtUtr());
        assertEquals(PolicyStatus.SETTLED, policy.getStatus());
    }

    @Test
    void testRejectClaim() {
        when(claimRepository.findById(200L)).thenReturn(Optional.of(savedClaim));
        when(userRepository.findById(3L)).thenReturn(Optional.of(officer));
        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        ClaimDTO result = claimService.rejectClaim(200L, 3L, "Damage outside policy terms");

        assertNotNull(result);
        assertEquals(ClaimStatus.REJECTED, savedClaim.getStatus());
    }
}
