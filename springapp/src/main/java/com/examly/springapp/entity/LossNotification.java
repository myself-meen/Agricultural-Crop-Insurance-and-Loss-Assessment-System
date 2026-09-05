package com.examly.springapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loss_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "notification_date")
    private LocalDateTime notificationDate = LocalDateTime.now();

    @Column(name = "geo_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal geoLat;

    @Column(name = "geo_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal geoLng;

    @Column(name = "satellite_ndvi_score", precision = 3, scale = 2)
    private BigDecimal satelliteNdviScore;

    @Column(name = "photo_urls", columnDefinition = "TEXT")
    private String photoUrls;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LossStatus status = LossStatus.SUBMITTED;
}
