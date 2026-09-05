package com.examly.springapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrolled_by_id")
    private User enrolledBy;

    @Column(name = "khasra_survey_no", nullable = false, length = 50)
    private String khasraSurveyNo;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(nullable = false, length = 50)
    private String district;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Season season;

    @Column(name = "crop_year", nullable = false)
    private Integer cropYear;

    @Column(name = "sown_area_ha", nullable = false, precision = 10, scale = 2)
    private BigDecimal sownAreaHa;

    @Column(name = "sum_insured", nullable = false, precision = 12, scale = 2)
    private BigDecimal sumInsured;

    @Column(name = "premium_farmer", nullable = false, precision = 12, scale = 2)
    private BigDecimal premiumFarmer;

    @Column(name = "premium_state", nullable = false, precision = 12, scale = 2)
    private BigDecimal premiumState;

    @Column(name = "premium_centre", nullable = false, precision = 12, scale = 2)
    private BigDecimal premiumCentre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate = LocalDate.now();
}
