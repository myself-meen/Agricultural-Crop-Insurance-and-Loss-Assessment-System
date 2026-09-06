package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.audit.EncryptionUtil;
import com.examly.springapp.dto.FarmerProfileDTO;
import com.examly.springapp.entity.FarmerProfile;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.InvalidAadhaarException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.FarmerProfileRepository;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerProfileService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final UserRepository userRepository;
    private final EncryptionUtil encryptionUtil;
    private final AuditService auditService;

    public FarmerProfileDTO createOrUpdateProfile(Long userId, FarmerProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!dto.getAadhaarNumber().matches("^\\d{12}$")) {
            throw new InvalidAadhaarException("Aadhaar number must be exactly 12 digits");
        }

        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElse(new FarmerProfile());

        profile.setUser(user);
        profile.setAadhaarNumber(encryptionUtil.encrypt(dto.getAadhaarNumber()));
        profile.setBankAccountNo(dto.getBankAccountNo());
        profile.setIfscCode(dto.getIfscCode());
        profile.setBankName(dto.getBankName());
        profile.setState(dto.getState());
        profile.setDistrict(dto.getDistrict());
        profile.setPincode(dto.getPincode());

        FarmerProfile saved = farmerProfileRepository.save(profile);

        auditService.logAction(userId, "FARMER_PROFILE_SAVED", "FARMER_PROFILE", saved.getId(),
                "Farmer KYC profile created/updated", "127.0.0.1");

        return convertToDTO(saved);
    }

    public List<FarmerProfileDTO> getAllProfiles() {
        return farmerProfileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FarmerProfileDTO getProfileByUserId(Long userId) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for User ID: " + userId));
        return convertToDTO(profile);
    }

    private FarmerProfileDTO convertToDTO(FarmerProfile profile) {
        FarmerProfileDTO dto = new FarmerProfileDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        // Decrypt Aadhaar for response
        dto.setAadhaarNumber(encryptionUtil.decrypt(profile.getAadhaarNumber()));
        dto.setBankAccountNo(profile.getBankAccountNo());
        dto.setIfscCode(profile.getIfscCode());
        dto.setBankName(profile.getBankName());
        dto.setState(profile.getState());
        dto.setDistrict(profile.getDistrict());
        dto.setPincode(profile.getPincode());
        return dto;
    }
}
