package com.examly.springapp.repository;

import com.examly.springapp.model.SurveyAssignment;
import com.examly.springapp.model.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyAssignmentRepository extends JpaRepository<SurveyAssignment, Long> {
    List<SurveyAssignment> findBySurveyorId(Long surveyorId);
    List<SurveyAssignment> findBySurveyorIdAndStatus(Long surveyorId, SurveyStatus status);
    Optional<SurveyAssignment> findByNotificationId(Long notificationId);
}
