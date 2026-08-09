package com.examly.springapp.repository;

import com.examly.springapp.model.Policy;
import com.examly.springapp.model.PolicyStatus;
import com.examly.springapp.model.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByFarmerId(Long farmerId);
    List<Policy> findByStatus(PolicyStatus status);
    Optional<Policy> findByFarmerIdAndCropNameAndSeasonAndCropYear(
            Long farmerId, String cropName, Season season, Integer cropYear
    );
}
