package com.examly.springapp.service;
import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.PolicyDTO;
import com.examly.springapp.entity.Policy;
import com.examly.springapp.entity.PolicyStatus;
import com.examly.springapp.entity.Season;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.entity.FarmerProfile;
import com.examly.springapp.repository.ClaimRepository;
import com.examly.springapp.repository.FarmerProfileRepository;
import com.examly.springapp.repository.LossNotificationRepository;
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
    private final FarmerProfileRepository farmerProfileRepository;
    private final LossNotificationRepository lossNotificationRepository;
    private final ClaimRepository claimRepository;
    private final AuditService auditService;

    public PolicyDTO enrollPolicy(Long farmerId, PolicyDTO dto, Long enrolledById) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + farmerId));

        User enrolledBy = enrolledById != null ? userRepository.findById(enrolledById).orElse(null) : farmer;

        if (dto.getKhasraSurveyNo() != null && policyRepository.existsByFarmerIdAndKhasraSurveyNoAndCropNameAndSeasonAndCropYear(
                farmerId, dto.getKhasraSurveyNo(), dto.getCropName(), dto.getSeason(), dto.getCropYear())) {
            throw new IllegalArgumentException("A policy for this land plot (Khasra: " + dto.getKhasraSurveyNo() +
                    "), crop (" + dto.getCropName() + "), and season (" + dto.getSeason() + " " + dto.getCropYear() + ") is already enrolled.");
        }

        FarmerProfile farmerProfile = farmerProfileRepository != null
                ? farmerProfileRepository.findByUserId(farmerId).orElse(null)
                : null;

        String district = (dto.getDistrict() != null && !dto.getDistrict().trim().isEmpty()) ? dto.getDistrict().trim() : null;
        if (district == null && farmerProfile != null && farmerProfile.getDistrict() != null && !farmerProfile.getDistrict().trim().isEmpty()) {
            district = farmerProfile.getDistrict().trim();
        }
        if (district == null) {
            district = "Regional District";
        }

        String state = (dto.getState() != null && !dto.getState().trim().isEmpty()) ? dto.getState().trim() : null;
        if (state == null && farmerProfile != null && farmerProfile.getState() != null && !farmerProfile.getState().trim().isEmpty()) {
            state = farmerProfile.getState().trim();
        }
        if (state == null) {
            state = "State Jurisdiction";
        }

        Policy policy = new Policy();

        policy.setFarmer(farmer);
        policy.setEnrolledBy(enrolledBy);
        policy.setKhasraSurveyNo(dto.getKhasraSurveyNo());
        policy.setState(state);
        policy.setDistrict(district);
        policy.setCropName(dto.getCropName());
        policy.setSeason(dto.getSeason());
        policy.setCropYear(dto.getCropYear() != null ? dto.getCropYear() : LocalDate.now().getYear());

        policy.setSownAreaHa(dto.getSownAreaHa());

        // PMFBY standard sum insured calculation: e.g. 50,000 INR per hectare
        BigDecimal sumInsured = dto.getSumInsured() != null ? dto.getSumInsured() :
                dto.getSownAreaHa().multiply(new BigDecimal("50000.00"));
        policy.setSumInsured(sumInsured.setScale(2, RoundingMode.HALF_UP));

        // PMFBY season-based farmer premium rates:
        // Kharif: 2.0%, Rabi: 1.5%, Zaid / Commercial: 5.0%
        BigDecimal farmerRate;
        if (policy.getSeason() == Season.KHARIF) {
            farmerRate = new BigDecimal("0.02");
        } else if (policy.getSeason() == Season.RABI) {
            farmerRate = new BigDecimal("0.015");
        } else {
            farmerRate = new BigDecimal("0.05");
        }

        BigDecimal premiumFarmer = sumInsured.multiply(farmerRate).setScale(2, RoundingMode.HALF_UP);
        policy.setPremiumFarmer(premiumFarmer);

        // Total actuarial premium estimate: 10% of sum insured
        BigDecimal totalActuarialPremium = sumInsured.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal govtSubsidyTotal = totalActuarialPremium.subtract(premiumFarmer);
        if (govtSubsidyTotal.compareTo(BigDecimal.ZERO) < 0) {
            govtSubsidyTotal = BigDecimal.ZERO;
        }

        // 50% State Government share, 50% Central Government share
        BigDecimal stateShare = govtSubsidyTotal.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
        BigDecimal centreShare = govtSubsidyTotal.subtract(stateShare);

        policy.setPremiumState(stateShare);
        policy.setPremiumCentre(centreShare);

        policy.setStatus(PolicyStatus.ENROLLED);
        policy.setEnrollmentDate(LocalDate.now());

        Policy saved = policyRepository.save(policy);

        auditService.logAction(farmerId, "POLICY_ENROLLED", "POLICY", saved.getId(),
                "Enrolled policy for crop: " + saved.getCropName() + " with sum insured: " + saved.getSumInsured(), "127.0.0.1");

        return convertToDTO(saved);
    }

    public List<PolicyDTO> getPoliciesByStatus(PolicyStatus status) {
        return policyRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PolicyDTO updatePolicyStatus(Long id, PolicyStatus status) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + id));
        policy.setStatus(status);
        Policy updated = policyRepository.save(policy);
        auditService.logAction(policy.getFarmer().getId(), "POLICY_STATUS_UPDATED", "POLICY", id,
                "Policy status changed to: " + status, "127.0.0.1");
        return convertToDTO(updated);
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

    public void deletePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + id));

        if (!lossNotificationRepository.findByPolicyId(id).isEmpty()) {
            throw new IllegalStateException("Cannot delete policy ID " + id + " because active loss notifications are linked to it.");
        }

        if (!claimRepository.findByPolicyId(id).isEmpty()) {
            throw new IllegalStateException("Cannot delete policy ID " + id + " because claims are registered under it.");
        }

        Long farmerId = policy.getFarmer() != null ? policy.getFarmer().getId() : 1L;
        policyRepository.delete(policy);
        auditService.logAction(farmerId, "POLICY_DELETED", "POLICY", id,
                "Cancelled and deleted policy ID: " + id + " for crop: " + policy.getCropName(), "127.0.0.1");
    }

    public PolicyDTO convertToDTO(Policy policy) {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(policy.getId());
        if (policy.getFarmer() != null) {
            dto.setFarmerId(policy.getFarmer().getId());
            dto.setFarmerName(policy.getFarmer().getName());
        }
        if (policy.getEnrolledBy() != null) {
            dto.setEnrolledById(policy.getEnrolledBy().getId());
            dto.setEnrolledByName(policy.getEnrolledBy().getName());
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
