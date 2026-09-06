package com.examly.springapp.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username/Email/Phone is required")
    @JsonAlias({"email", "username", "phone", "userId"})
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
