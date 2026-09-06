package com.examly.springapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.examly.springapp.entity.PolicyStatus;
import com.examly.springapp.entity.Season;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDTO {

    private Long id;
    private Long farmerId;
    private String farmerName;
    private Long enrolledById;
    private String enrolledByName;

    @NotBlank(message = "Khasra/Survey number is required")
    @JsonAlias({"khasraNumber", "khasra_number", "surveyNumber"})
    private String khasraSurveyNo;

    private String state;
    private String district;

    @NotBlank(message = "Crop name is required")
    private String cropName;

    @NotNull(message = "Season is required")
    private Season season;

    @JsonAlias({"year"})
    private Integer cropYear;

    @NotNull(message = "Sown area in hectares is required")
    @JsonAlias({"sownAreaHectares", "sownArea", "area"})
    private BigDecimal sownAreaHa;


    private BigDecimal sumInsured;
    private BigDecimal premiumFarmer;
    private BigDecimal premiumState;
    private BigDecimal premiumCentre;
    private PolicyStatus status;
    private LocalDate enrollmentDate;
}
