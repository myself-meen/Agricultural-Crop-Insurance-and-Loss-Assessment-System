package com.examly.springapp.service;
import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.PolicyDTO;
import com.examly.springapp.entity.Policy;
import com.examly.springapp.entity.PolicyStatus;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.PolicyRepository;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public PolicyDTO enrollPolicy(Long farmerId, PolicyDTO dto, Long enrolledById) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + farmerId));

        User enrolledBy = enrolledById != null ? userRepository.findById(enrolledById).orElse(null) : farmer;

        Policy policy = new Policy();
        policy.setFarmer(farmer);
        policy.setEnrolledBy(enrolledBy);
        policy.setKhasraSurveyNo(dto.getKhasraSurveyNo());
        policy.setState(dto.getState());
        policy.setDistrict(dto.getDistrict());
        policy.setCropName(dto.getCropName());
        policy.setSeason(dto.getSeason());
        policy.setCropYear(dto.getCropYear());
        policy.setSownAreaHa(dto.getSownAreaHa());

        // PMFBY standard sum insured calculation: e.g. 50,000 INR per hectare
        BigDecimal sumInsured = dto.getSumInsured() != null ? dto.getSumInsured() :
                dto.getSownAreaHa().multiply(new BigDecimal("50000.00"));
        policy.setSumInsured(sumInsured);

        // PMFBY premium breakdown: Farmer pays 2%, State government 49%, Centre government 49%
        BigDecimal farmerRate = new BigDecimal("0.02");
        BigDecimal totalPremium = sumInsured.multiply(farmerRate);
        policy.setPremiumFarmer(totalPremium.setScale(2, RoundingMode.HALF_UP));

        BigDecimal govtShareRate = new BigDecimal("0.49");
        policy.setPremiumState(sumInsured.multiply(new BigDecimal("0.05")).multiply(govtShareRate).setScale(2, RoundingMode.HALF_UP));
        policy.setPremiumCentre(sumInsured.multiply(new BigDecimal("0.05")).multiply(govtShareRate).setScale(2, RoundingMode.HALF_UP));

        policy.setStatus(PolicyStatus.ENROLLED);
        policy.setEnrollmentDate(LocalDate.now());

        Policy saved = policyRepository.save(policy);

        auditService.logAction(farmerId, "POLICY_ENROLLED", "POLICY", saved.getId(),
                "Enrolled policy for crop: " + saved.getCropName() + " with sum insured: " + saved.getSumInsured(), "127.0.0.1");

        return convertToDTO(saved);
    }

    public List<PolicyDTO> getPoliciesByFarmer(Long farmerId) {
        return policyRepository.findByFarmerId(farmerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PolicyDTO> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PolicyDTO getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + id));
        return convertToDTO(policy);
    }

    public PolicyDTO convertToDTO(Policy policy) {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(policy.getId());
        dto.setFarmerId(policy.getFarmer().getId());
        if (policy.getEnrolledBy() != null) {
            dto.setEnrolledById(policy.getEnrolledBy().getId());
        }
        dto.setKhasraSurveyNo(policy.getKhasraSurveyNo());
        dto.setState(policy.getState());
        dto.setDistrict(policy.getDistrict());
        dto.setCropName(policy.getCropName());
        dto.setSeason(policy.getSeason());
        dto.setCropYear(policy.getCropYear());
        dto.setSownAreaHa(policy.getSownAreaHa());
        dto.setSumInsured(policy.getSumInsured());
        dto.setPremiumFarmer(policy.getPremiumFarmer());
        dto.setPremiumState(policy.getPremiumState());
        dto.setPremiumCentre(policy.getPremiumCentre());
        dto.setStatus(policy.getStatus());
        dto.setEnrollmentDate(policy.getEnrollmentDate());
        return dto;
    }
}
