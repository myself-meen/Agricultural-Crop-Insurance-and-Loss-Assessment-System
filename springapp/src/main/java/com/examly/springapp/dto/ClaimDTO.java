package com.examly.springapp.dto;

import com.examly.springapp.entity.ClaimStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDTO {

    private Long id;

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotNull(message = "Survey ID is required")
    private Long surveyId;

    private Long level1ApproverId;
    private LocalDateTime level1ApprovedAt;
    private Long level2ApproverId;
    private LocalDateTime level2ApprovedAt;

    private BigDecimal claimedAmount;
    private BigDecimal approvedAmount;
    private String dbtBankAccount;
    private String dbtIfsc;
    private String dbtUtr;
    private LocalDate disbursedDate;
    private String remarks;
    private ClaimStatus status;

    // Contextual fields for frontend display
    private Long farmerId;
    private String farmerName;
    private String cropName;
    private String district;
    private String season;
    private BigDecimal sumInsured;
    private BigDecimal lossAssessedPct;
    private String claimNumber;
    private Long lossNotificationId;
}
