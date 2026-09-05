package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {

    private long totalFarmers;
    private long totalPolicies;
    private BigDecimal totalSumInsured;
    private BigDecimal totalFarmerPremium;
    private BigDecimal totalSubsidyAmount;

    private long totalLossNotifications;
    private long totalSurveysCompleted;
    private long totalClaims;
    private long totalClaimsApproved;
    private long totalClaimsPaid;
    private BigDecimal totalDisbursedAmount;

    private Map<String, Long> lossByType;
    private Map<String, Long> claimsByStatus;
    private Map<String, Long> policiesBySeason;
}
