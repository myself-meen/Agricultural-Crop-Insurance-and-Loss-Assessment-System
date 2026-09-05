package com.examly.springapp.dto;

import com.examly.springapp.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String name;
    private String phoneNumber;
    private String email;
    private Role role;
    private LocalDateTime createdDate;
    private LocalDateTime lastLogin;
    private Boolean isActive;
}
