package com.examly.springapp.repository;

import com.examly.springapp.entity.SurveyAssignment;
import com.examly.springapp.entity.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyAssignmentRepository extends JpaRepository<SurveyAssignment, Long> {
    List<SurveyAssignment> findBySurveyorId(Long surveyorId);
    Optional<SurveyAssignment> findByNotificationId(Long notificationId);
    List<SurveyAssignment> findByStatus(SurveyStatus status);
}
