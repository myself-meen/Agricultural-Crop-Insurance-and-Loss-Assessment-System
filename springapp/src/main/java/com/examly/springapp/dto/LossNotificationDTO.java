package com.examly.springapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    private Long policyId;

    @NotNull(message = "Loss type is required")
    private LossType lossType;

    @JsonAlias({"affectedArea", "area", "affected_area_ha", "sownAreaHa"})
    private BigDecimal affectedAreaHa;

    @JsonAlias({"incidentDate", "incident_date", "loss_date"})
    private LocalDateTime lossDate;

    private LocalDateTime notificationDate;

    @JsonAlias({"latitude", "lat", "geo_lat"})
    private BigDecimal geoLat;

    @JsonAlias({"longitude", "lng", "geo_lng"})
    private BigDecimal geoLng;

    private BigDecimal satelliteNdviScore;

    @JsonAlias({"photoEvidenceUrl", "photoUrl", "photos"})
    private String photoUrls;

    private LossStatus status;

    // Contextual fields populated for frontend display
    private Long farmerId;
    private String farmerName;
    private String cropName;
    private String district;
    private String state;
    private Long surveyId;
    private String surveyStatus;
    private BigDecimal lossAssessedPct;
}

