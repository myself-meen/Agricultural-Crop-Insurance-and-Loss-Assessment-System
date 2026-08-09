package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private SurveyAssignment survey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level1_approver_id")
    private User level1Approver;

    @Column(name = "level1_approved_at")
    private LocalDateTime level1ApprovedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level2_approver_id")
    private User level2Approver;

    @Column(name = "level2_approved_at")
    private LocalDateTime level2ApprovedAt;

    @Column(name = "claimed_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal claimedAmount;

    @Column(name = "approved_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "dbt_bank_account", nullable = false, length = 18)
    private String dbtBankAccount;

    @Column(name = "dbt_ifsc", nullable = false, length = 11)
    private String dbtIfsc;

    @Column(name = "dbt_utr", length = 50)
    private String dbtUtr;

    @Column(name = "disbursed_date")
    private LocalDate disbursedDate;

    @Column(length = 500)
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;
}
