package com.examly.springapp.repository;

import com.examly.springapp.entity.LossNotification;
import com.examly.springapp.entity.LossStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LossNotificationRepository extends JpaRepository<LossNotification, Long> {
    List<LossNotification> findByPolicyId(Long policyId);
    List<LossNotification> findByStatus(LossStatus status);
}
