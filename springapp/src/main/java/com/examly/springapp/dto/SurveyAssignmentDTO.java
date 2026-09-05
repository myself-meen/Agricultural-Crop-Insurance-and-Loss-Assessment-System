package com.examly.springapp.dto;

import com.examly.springapp.entity.SurveyStatus;
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
public class SurveyAssignmentDTO {

    private Long id;

    @NotNull(message = "Notification ID is required")
    private Long notificationId;

    @NotNull(message = "Surveyor ID is required")
    private Long surveyorId;

    @NotNull(message = "Survey date is required")
    private LocalDate surveyDate;

    private LocalDateTime surveyCompletedAt;
    private BigDecimal surveyGeoLat;
    private BigDecimal surveyGeoLng;
    private BigDecimal yieldAssessedKgHa;
    private BigDecimal lossAssessedPct;
    private String surveyPhotos;
    private SurveyStatus status;
}
