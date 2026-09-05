package com.examly.springapp.repository;

import com.examly.springapp.entity.Claim;
import com.examly.springapp.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByPolicyId(Long policyId);
    Optional<Claim> findBySurveyId(Long surveyId);
    List<Claim> findByStatus(ClaimStatus status);
}
