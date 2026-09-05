package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {

    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String entityName;
    private Long entityId;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
