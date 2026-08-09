package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loss_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LossNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Enumerated(EnumType.STRING)
    @Column(name = "loss_type", nullable = false)
    private LossType lossType;

    @Column(name = "affected_area_ha", nullable = false, precision = 10, scale = 2)
    private BigDecimal affectedAreaHa;

    @Column(name = "loss_date", nullable = false)
    private LocalDateTime lossDate;

    @Column(name = "notification_date", updatable = false)
    private LocalDateTime notificationDate;

    @Column(name = "geo_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal geoLat;

    @Column(name = "geo_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal geoLng;

    @Column(name = "satellite_ndvi_score", precision = 3, scale = 2)
    private BigDecimal satelliteNdviScore;

    @Column(name = "photo_urls", columnDefinition = "TEXT", nullable = false)
    private String photoUrls;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurveyStatus status;

    @PrePersist
    protected void onCreate() {
        if (this.notificationDate == null) {
            this.notificationDate = LocalDateTime.now();
        }
    }
}
