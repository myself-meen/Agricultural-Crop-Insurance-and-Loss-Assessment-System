package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.ClaimDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.DuplicateClaimException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final SurveyAssignmentRepository surveyAssignmentRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ClaimDTO initiateClaim(Long surveyId) {
        SurveyAssignment survey = surveyAssignmentRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey assignment not found with ID: " + surveyId));

        if (claimRepository.findBySurveyId(surveyId).isPresent()) {
            throw new DuplicateClaimException("Claim has already been initiated for survey ID: " + surveyId);
        }

        Policy policy = survey.getNotification().getPolicy();

        // Calculate payout: sumInsured * (lossAssessedPct / 100)
        BigDecimal lossPct = survey.getLossAssessedPct() != null ? survey.getLossAssessedPct() : BigDecimal.ZERO;
        BigDecimal claimedAmount = policy.getSumInsured().multiply(lossPct)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // Fetch bank details from farmer profile
        FarmerProfile profile = farmerProfileRepository.findByUserId(policy.getFarmer().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for user ID: " + policy.getFarmer().getId()));

        Claim claim = new Claim();
        claim.setPolicy(policy);
        claim.setSurvey(survey);
        claim.setClaimedAmount(claimedAmount);
        claim.setApprovedAmount(claimedAmount);
        claim.setDbtBankAccount(profile.getBankAccountNo());
        claim.setDbtIfsc(profile.getIfscCode());
        claim.setStatus(ClaimStatus.INITIATED);

        Claim saved = claimRepository.save(claim);

        auditService.logAction(policy.getFarmer().getId(), "CLAIM_INITIATED", "CLAIM", saved.getId(),
                "Claim initiated for amount: INR " + claimedAmount, "127.0.0.1");

        return convertToDTO(saved);
    }

    public ClaimDTO level1Approve(Long claimId, Long officerId, String remarks) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer user not found with ID: " + officerId));

        claim.setLevel1Approver(officer);
        claim.setLevel1ApprovedAt(LocalDateTime.now());
        claim.setStatus(ClaimStatus.LEVEL1_APPROVED);
        if (remarks != null) claim.setRemarks(remarks);

        Claim saved = claimRepository.save(claim);

        auditService.logAction(officerId, "CLAIM_LEVEL1_APPROVED", "CLAIM", saved.getId(),
                "Level 1 approval completed for claim ID: " + claimId, "127.0.0.1");

        return convertToDTO(saved);
    }

    public ClaimDTO level2Approve(Long claimId, Long officerId, String remarks) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer user not found with ID: " + officerId));

        claim.setLevel2Approver(officer);
        claim.setLevel2ApprovedAt(LocalDateTime.now());
        claim.setStatus(ClaimStatus.APPROVED);
        if (remarks != null) claim.setRemarks(remarks);

        Claim saved = claimRepository.save(claim);

        auditService.logAction(officerId, "CLAIM_LEVEL2_APPROVED", "CLAIM", saved.getId(),
                "Level 2 final approval completed for claim ID: " + claimId, "127.0.0.1");

        return convertToDTO(saved);
    }
    public ClaimDTO disburseDbt(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));
        String utr = "UTR" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        claim.setDbtUtr(utr);
        claim.setDisbursedDate(LocalDate.now());
        claim.setStatus(ClaimStatus.PAID);
        // Update policy status to SETTLED
        Policy policy = claim.getPolicy();
        policy.setStatus(PolicyStatus.SETTLED);
        policyRepository.save(policy);
        Claim saved = claimRepository.save(claim);
        auditService.logAction(claim.getPolicy().getFarmer().getId(), "DBT_DISBURSED", "CLAIM", saved.getId(),
                "Disbursed INR " + claim.getApprovedAmount() + " via DBT. UTR: " + utr, "127.0.0.1");
        return convertToDTO(saved);
    }
    public ClaimDTO rejectClaim(Long claimId, Long officerId, String remarks) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + claimId));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer user not found with ID: " + officerId));

        claim.setStatus(ClaimStatus.REJECTED);
        if (remarks != null) claim.setRemarks(remarks);

        Claim saved = claimRepository.save(claim);

        auditService.logAction(officerId, "CLAIM_REJECTED", "CLAIM", saved.getId(),
                "Claim ID: " + claimId + " rejected. Reason: " + remarks, "127.0.0.1");

        return convertToDTO(saved);
    }

    public List<ClaimDTO> getClaimsByFarmer(Long farmerId) {
        List<Policy> policies = policyRepository.findByFarmerId(farmerId);
        return policies.stream()
                .flatMap(p -> claimRepository.findByPolicyId(p.getId()).stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ClaimDTO> getClaimsByStatus(ClaimStatus status) {
        return claimRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ClaimDTO> getClaimsByPolicy(Long policyId) {
        return claimRepository.findByPolicyId(policyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    public List<ClaimDTO> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ClaimDTO getClaimById(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with ID: " + id));
        return convertToDTO(claim);
    }

    public ClaimDTO convertToDTO(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(claim.getId());
        dto.setPolicyId(claim.getPolicy().getId());
        dto.setSurveyId(claim.getSurvey().getId());
        if (claim.getLevel1Approver() != null) {
            dto.setLevel1ApproverId(claim.getLevel1Approver().getId());
        }
        dto.setLevel1ApprovedAt(claim.getLevel1ApprovedAt());
        if (claim.getLevel2Approver() != null) {
            dto.setLevel2ApproverId(claim.getLevel2Approver().getId());
        }
        dto.setLevel2ApprovedAt(claim.getLevel2ApprovedAt());
        dto.setClaimedAmount(claim.getClaimedAmount());
        dto.setApprovedAmount(claim.getApprovedAmount());
        dto.setDbtBankAccount(claim.getDbtBankAccount());
        dto.setDbtIfsc(claim.getDbtIfsc());
        dto.setDbtUtr(claim.getDbtUtr());
        dto.setDisbursedDate(claim.getDisbursedDate());
        dto.setRemarks(claim.getRemarks());
        dto.setStatus(claim.getStatus());
        return dto;
    }
}
