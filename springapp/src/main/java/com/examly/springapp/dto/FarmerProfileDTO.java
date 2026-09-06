package com.examly.springapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FarmerProfileDTO {

    private Long id;
    private Long userId;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must be exactly 12 digits")
    @JsonAlias({"aadhaar", "aadhaarNo"})
    private String aadhaarNumber;

    @NotBlank(message = "Bank account number is required")
    @JsonAlias({"bankAccountNumber", "accountNumber", "accountNo"})
    private String bankAccountNo;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format")
    private String ifscCode;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
    @JsonAlias({"pinCode", "postalCode", "zipCode"})
    private String pincode;
}

