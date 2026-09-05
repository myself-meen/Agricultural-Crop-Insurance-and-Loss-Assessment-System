package com.examly.springapp.audit;
import com.examly.springapp.dto.AuditLogDTO;
import com.examly.springapp.entity.AuditLog;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.AuditLogRepository;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLog logAction(Long userId, String action, String entityName, Long entityId, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            auditLog.setUser(user);
        }
        auditLog.setAction(action);
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLog.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
        auditLog.setTimestamp(LocalDateTime.now());
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLogDTO> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AuditLogDTO convertToDTO(AuditLog log) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getId());
        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getId());
            dto.setUserName(log.getUser().getName());
        }
        dto.setAction(log.getAction());
        dto.setEntityName(log.getEntityName());
        dto.setEntityId(log.getEntityId());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }
}
