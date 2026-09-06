package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.PolicyDTO;
import com.examly.springapp.entity.Policy;
import com.examly.springapp.entity.PolicyStatus;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.Season;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.PolicyRepository;
import com.examly.springapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.examly.springapp.repository.FarmerProfileRepository farmerProfileRepository;

    @Mock
    private com.examly.springapp.repository.LossNotificationRepository lossNotificationRepository;

    @Mock
    private com.examly.springapp.repository.ClaimRepository claimRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PolicyService policyService;

    private User farmer;
    private PolicyDTO policyDTO;
    private Policy savedPolicy;

    @BeforeEach
    void setUp() {
        farmer = new User();
        farmer.setId(1L);
        farmer.setName("Ramesh Kumar");
        farmer.setRole(Role.FARMER);

        policyDTO = new PolicyDTO();
        policyDTO.setKhasraSurveyNo("KH-1024");
        policyDTO.setState("Maharashtra");
        policyDTO.setDistrict("Pune");
        policyDTO.setCropName("Paddy/Rice");
        policyDTO.setSeason(Season.KHARIF);
        policyDTO.setCropYear(2026);
        policyDTO.setSownAreaHa(new BigDecimal("2.50"));

        savedPolicy = new Policy();
        savedPolicy.setId(10L);
        savedPolicy.setFarmer(farmer);
        savedPolicy.setKhasraSurveyNo("KH-1024");
        savedPolicy.setState("Maharashtra");
        savedPolicy.setDistrict("Pune");
        savedPolicy.setCropName("Paddy/Rice");
        savedPolicy.setSeason(Season.KHARIF);
        savedPolicy.setCropYear(2026);
        savedPolicy.setSownAreaHa(new BigDecimal("2.50"));
        savedPolicy.setSumInsured(new BigDecimal("125000.00"));
        savedPolicy.setPremiumFarmer(new BigDecimal("2500.00"));
        savedPolicy.setPremiumState(new BigDecimal("5000.00"));
        savedPolicy.setPremiumCentre(new BigDecimal("5000.00"));
        savedPolicy.setStatus(PolicyStatus.ENROLLED);
        savedPolicy.setEnrollmentDate(LocalDate.now());
    }

    @Test
    void testEnrollPolicyKharif() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(farmer));
        when(policyRepository.existsByFarmerIdAndKhasraSurveyNoAndCropNameAndSeasonAndCropYear(any(), any(), any(), any(), any())).thenReturn(false);
        when(policyRepository.save(any(Policy.class))).thenReturn(savedPolicy);

        PolicyDTO result = policyService.enrollPolicy(1L, policyDTO, null);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Paddy/Rice", result.getCropName());
        assertEquals(Season.KHARIF, result.getSeason());
        verify(policyRepository, times(1)).save(any(Policy.class));
    }

    @Test
    void testEnrollDuplicatePolicyThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(farmer));
        when(policyRepository.existsByFarmerIdAndKhasraSurveyNoAndCropNameAndSeasonAndCropYear(any(), any(), any(), any(), any())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> policyService.enrollPolicy(1L, policyDTO, null));
    }


    @Test
    void testEnrollPolicyFarmerNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> policyService.enrollPolicy(99L, policyDTO, null));
    }

    @Test
    void testGetPoliciesByFarmer() {
        when(policyRepository.findByFarmerId(1L)).thenReturn(List.of(savedPolicy));

        List<PolicyDTO> policies = policyService.getPoliciesByFarmer(1L);
        assertEquals(1, policies.size());
        assertEquals("KH-1024", policies.get(0).getKhasraSurveyNo());
    }

    @Test
    void testGetPolicyById() {
        when(policyRepository.findById(10L)).thenReturn(Optional.of(savedPolicy));

        PolicyDTO result = policyService.getPolicyById(10L);
        assertNotNull(result);
        assertEquals(10L, result.getId());
    }

    @Test
    void testUpdatePolicyStatus() {
        when(policyRepository.findById(10L)).thenReturn(Optional.of(savedPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(savedPolicy);

        PolicyDTO result = policyService.updatePolicyStatus(10L, PolicyStatus.ACTIVE);
        assertNotNull(result);
        verify(policyRepository, times(1)).save(any(Policy.class));
    }
}
