package com.examly.springapp.repository;

import com.examly.springapp.model.Claim;
import com.examly.springapp.model.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByPolicyId(Long policyId);
    List<Claim> findByStatus(ClaimStatus status);
    Optional<Claim> findBySurveyId(Long surveyId);
}
