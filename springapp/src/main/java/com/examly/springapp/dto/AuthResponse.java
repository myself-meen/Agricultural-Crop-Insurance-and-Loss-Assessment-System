package com.examly.springapp.dto;

import com.examly.springapp.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private Role role;
}
