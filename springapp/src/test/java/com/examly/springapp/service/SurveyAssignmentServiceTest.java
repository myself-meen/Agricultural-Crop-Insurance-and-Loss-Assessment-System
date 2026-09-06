package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.SurveyAssignmentDTO;
import com.examly.springapp.entity.*;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.LossNotificationRepository;
import com.examly.springapp.repository.SurveyAssignmentRepository;
import com.examly.springapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SurveyAssignmentServiceTest {

    @Mock
    private SurveyAssignmentRepository surveyAssignmentRepository;

    @Mock
    private LossNotificationRepository lossNotificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.examly.springapp.repository.ClaimRepository claimRepository;

    @Mock
    private ClaimService claimService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private SurveyAssignmentService surveyAssignmentService;

    private LossNotification notification;
    private User surveyor;
    private SurveyAssignment savedAssignment;

    @BeforeEach
    void setUp() {
        notification = new LossNotification();
        notification.setId(100L);
        notification.setStatus(LossStatus.SUBMITTED);

        surveyor = new User();
        surveyor.setId(5L);
        surveyor.setName("Vikas Surveyor");
        surveyor.setRole(Role.SURVEYOR);

        savedAssignment = new SurveyAssignment();
        savedAssignment.setId(50L);
        savedAssignment.setNotification(notification);
        savedAssignment.setSurveyor(surveyor);
        savedAssignment.setSurveyDate(LocalDate.now().plusDays(2));
        savedAssignment.setStatus(SurveyStatus.ASSIGNED);
    }

    @Test
    void testAssignSurveyorSuccess() {
        SurveyAssignmentDTO dto = new SurveyAssignmentDTO();
        dto.setSurveyDate(LocalDate.now().plusDays(2));

        when(lossNotificationRepository.findById(100L)).thenReturn(Optional.of(notification));
        when(userRepository.findById(5L)).thenReturn(Optional.of(surveyor));
        when(surveyAssignmentRepository.save(any(SurveyAssignment.class))).thenReturn(savedAssignment);

        SurveyAssignmentDTO result = surveyAssignmentService.assignSurveyor(100L, 5L, dto);

        assertNotNull(result);
        assertEquals(50L, result.getId());
        assertEquals(SurveyStatus.ASSIGNED, result.getStatus());
        assertEquals(LossStatus.SURVEYOR_ASSIGNED, notification.getStatus());
    }

    @Test
    void testSubmitSurveyResultsSuccess() {
        SurveyAssignmentDTO submitDto = new SurveyAssignmentDTO();
        submitDto.setSurveyGeoLat(new BigDecimal("18.5204"));
        submitDto.setSurveyGeoLng(new BigDecimal("73.8567"));
        submitDto.setYieldAssessedKgHa(new BigDecimal("1200.00"));
        submitDto.setLossAssessedPct(new BigDecimal("60.00"));
        submitDto.setSurveyPhotos("[\"photo1.jpg\"]");

        when(surveyAssignmentRepository.findById(50L)).thenReturn(Optional.of(savedAssignment));
        when(surveyAssignmentRepository.save(any(SurveyAssignment.class))).thenReturn(savedAssignment);

        SurveyAssignmentDTO result = surveyAssignmentService.submitSurveyResults(50L, submitDto);

        assertNotNull(result);
        assertEquals(SurveyStatus.SUBMITTED, savedAssignment.getStatus());
        assertEquals(LossStatus.SURVEYED, notification.getStatus());
    }

    @Test
    void testGetAssignmentsBySurveyor() {
        when(surveyAssignmentRepository.findBySurveyorId(5L)).thenReturn(List.of(savedAssignment));

        List<SurveyAssignmentDTO> results = surveyAssignmentService.getAssignmentsBySurveyor(5L);
        assertEquals(1, results.size());
        assertEquals(50L, results.get(0).getId());
    }

    @Test
    void testGetAssignmentByIdNotFound() {
        when(surveyAssignmentRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> surveyAssignmentService.getAssignmentById(99L));
    }
}
