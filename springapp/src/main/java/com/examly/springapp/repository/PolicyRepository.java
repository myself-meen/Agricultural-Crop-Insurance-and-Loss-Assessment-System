package com.examly.springapp.repository;

import com.examly.springapp.entity.Policy;
import com.examly.springapp.entity.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByFarmerId(Long farmerId);
    List<Policy> findByStatus(PolicyStatus status);
}
