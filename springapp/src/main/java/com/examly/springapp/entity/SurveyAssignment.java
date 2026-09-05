package com.examly.springapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "survey_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private LossNotification notification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surveyor_id", nullable = false)
    private User surveyor;

    @Column(name = "survey_date", nullable = false)
    private LocalDate surveyDate;

    @Column(name = "survey_completed_at")
    private LocalDateTime surveyCompletedAt;

    @Column(name = "survey_geo_lat", precision = 10, scale = 8)
    private BigDecimal surveyGeoLat;

    @Column(name = "survey_geo_lng", precision = 11, scale = 8)
    private BigDecimal surveyGeoLng;

    @Column(name = "yield_assessed_kg_ha", precision = 10, scale = 2)
    private BigDecimal yieldAssessedKgHa;

    @Column(name = "loss_assessed_pct", precision = 5, scale = 2)
    private BigDecimal lossAssessedPct;

    @Column(name = "survey_photos", columnDefinition = "TEXT")
    private String surveyPhotos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurveyStatus status = SurveyStatus.ASSIGNED;
}
