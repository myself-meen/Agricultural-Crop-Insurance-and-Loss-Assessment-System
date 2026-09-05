package com.examly.springapp.dto;

import com.examly.springapp.entity.LossStatus;
import com.examly.springapp.entity.LossType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LossNotificationDTO {

    private Long id;

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotNull(message = "Loss type is required")
    private LossType lossType;

    @NotNull(message = "Affected area in hectares is required")
    private BigDecimal affectedAreaHa;

    @NotNull(message = "Loss date is required")
    private LocalDateTime lossDate;

    private LocalDateTime notificationDate;

    @NotNull(message = "Latitude is required")
    private BigDecimal geoLat;

    @NotNull(message = "Longitude is required")
    private BigDecimal geoLng;

    private BigDecimal satelliteNdviScore;
    private String photoUrls;
    private LossStatus status;
}
