package com.examly.springapp.repository;

import com.examly.springapp.model.LossNotification;
import com.examly.springapp.model.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LossNotificationRepository extends JpaRepository<LossNotification, Long> {
    List<LossNotification> findByPolicyId(Long policyId);
    List<LossNotification> findByStatus(SurveyStatus status);
}
