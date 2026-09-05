package com.examly.springapp.service;

import com.examly.springapp.dto.AnalyticsDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final LossNotificationRepository lossNotificationRepository;
    private final SurveyAssignmentRepository surveyAssignmentRepository;
    private final ClaimRepository claimRepository;

    public AnalyticsDTO getDashboardAnalytics() {
        long totalFarmers = userRepository.findByRole(Role.FARMER).size();

        List<Policy> policies = policyRepository.findAll();
        long totalPolicies = policies.size();

        BigDecimal totalSumInsured = policies.stream()
                .map(Policy::getSumInsured)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFarmerPremium = policies.stream()
                .map(p -> p.getPremiumFarmer() != null ? p.getPremiumFarmer() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSubsidy = policies.stream()
                .map(p -> {
                    BigDecimal state = p.getPremiumState() != null ? p.getPremiumState() : BigDecimal.ZERO;
                    BigDecimal centre = p.getPremiumCentre() != null ? p.getPremiumCentre() : BigDecimal.ZERO;
                    return state.add(centre);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<LossNotification> lossNotifications = lossNotificationRepository.findAll();
        long totalLossNotifications = lossNotifications.size();

        List<SurveyAssignment> surveys = surveyAssignmentRepository.findAll();
        long totalSurveysCompleted = surveys.stream()
                .filter(s -> s.getStatus() == SurveyStatus.SUBMITTED || s.getStatus() == SurveyStatus.VERIFIED)
                .count();

        List<Claim> claims = claimRepository.findAll();
        long totalClaims = claims.size();

        long totalClaimsApproved = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.LEVEL1_APPROVED || c.getStatus() == ClaimStatus.APPROVED || c.getStatus() == ClaimStatus.PAID)
                .count();

        long totalClaimsPaid = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.PAID)
                .count();

        BigDecimal totalDisbursed = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.PAID && c.getApprovedAmount() != null)
                .map(Claim::getApprovedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> lossByType = lossNotifications.stream()
                .collect(Collectors.groupingBy(l -> l.getLossType().name(), Collectors.counting()));

        Map<String, Long> claimsByStatus = claims.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));

        Map<String, Long> policiesBySeason = policies.stream()
                .collect(Collectors.groupingBy(p -> p.getSeason().name(), Collectors.counting()));

        return new AnalyticsDTO(
                totalFarmers,
                totalPolicies,
                totalSumInsured,
                totalFarmerPremium,
                totalSubsidy,
                totalLossNotifications,
                totalSurveysCompleted,
                totalClaims,
                totalClaimsApproved,
                totalClaimsPaid,
                totalDisbursed,
                lossByType,
                claimsByStatus,
                policiesBySeason
        );
    }
}
