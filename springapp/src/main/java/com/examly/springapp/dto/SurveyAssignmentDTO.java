package com.examly.springapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.examly.springapp.entity.SurveyStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyAssignmentDTO {

    private Long id;

    private Long notificationId;

    private Long surveyorId;

    @JsonAlias({"date", "scheduledDate"})
    private LocalDate surveyDate;

    private LocalDateTime surveyCompletedAt;

    @JsonAlias({"surveyorLatitude", "latitude", "lat", "survey_geo_lat"})
    private BigDecimal surveyGeoLat;

    @JsonAlias({"surveyorLongitude", "longitude", "lng", "survey_geo_lng"})
    private BigDecimal surveyGeoLng;

    @JsonAlias({"yieldAssessed", "yield", "yield_assessed_kg_ha"})
    private BigDecimal yieldAssessedKgHa;

    @JsonAlias({"assessedLossPercentage", "lossPercentage", "lossVal", "lossPct", "loss_assessed_pct"})
    private BigDecimal lossAssessedPct;

    @JsonAlias({"photos", "photoUrls", "survey_photos", "surveyRemarks"})
    private String surveyPhotos;

    private SurveyStatus status;

    private String farmerName;
    private String cropName;
    private String district;
    private String surveyorName;
    private String lossType;
}

