package com.examly.springapp.controller;
import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.AuditLogDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditLogController {
    private final AuditService auditService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAllAuditLogs() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Audit logs fetched successfully", auditService.getAllAuditLogs()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User audit logs fetched successfully", auditService.getAuditLogsByUser(userId)));
    }
}
