package com.examly.springapp.repository;

import com.examly.springapp.model.FarmerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerProfileRepository extends JpaRepository<FarmerProfile, Long> {
    Optional<FarmerProfile> findByUserId(Long userId);
    Optional<FarmerProfile> findByAadhaarNumber(String aadhaarNumber);
    Boolean existsByAadhaarNumber(String aadhaarNumber);
}
