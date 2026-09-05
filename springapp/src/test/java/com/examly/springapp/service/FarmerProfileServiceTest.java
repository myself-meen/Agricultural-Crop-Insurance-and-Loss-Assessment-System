package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.audit.EncryptionUtil;
import com.examly.springapp.dto.FarmerProfileDTO;
import com.examly.springapp.entity.FarmerProfile;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.InvalidAadhaarException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.FarmerProfileRepository;
import com.examly.springapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FarmerProfileServiceTest {

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EncryptionUtil encryptionUtil;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private FarmerProfileService farmerProfileService;

    private User farmer;
    private FarmerProfileDTO profileDTO;
    private FarmerProfile savedProfile;

    @BeforeEach
    void setUp() {
        farmer = new User();
        farmer.setId(1L);
        farmer.setName("Ramesh");
        farmer.setRole(Role.FARMER);

        profileDTO = new FarmerProfileDTO();
        profileDTO.setAadhaarNumber("123456789012");
        profileDTO.setBankAccountNo("987654321012");
        profileDTO.setIfscCode("SBIN0001234");
        profileDTO.setBankName("State Bank of India");
        profileDTO.setState("Maharashtra");
        profileDTO.setDistrict("Pune");
        profileDTO.setPincode("411001");

        savedProfile = new FarmerProfile();
        savedProfile.setId(10L);
        savedProfile.setUser(farmer);
        savedProfile.setAadhaarNumber("encrypted_aadhaar");
        savedProfile.setBankAccountNo("987654321012");
        savedProfile.setIfscCode("SBIN0001234");
        savedProfile.setBankName("State Bank of India");
        savedProfile.setState("Maharashtra");
        savedProfile.setDistrict("Pune");
        savedProfile.setPincode("411001");
    }

    @Test
    void testCreateProfileSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(farmer));
        when(farmerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(encryptionUtil.encrypt("123456789012")).thenReturn("encrypted_aadhaar");
        when(encryptionUtil.decrypt("encrypted_aadhaar")).thenReturn("123456789012");
        when(farmerProfileRepository.save(any(FarmerProfile.class))).thenReturn(savedProfile);

        FarmerProfileDTO result = farmerProfileService.createOrUpdateProfile(1L, profileDTO);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("123456789012", result.getAadhaarNumber());
        assertEquals("SBIN0001234", result.getIfscCode());
        verify(farmerProfileRepository, times(1)).save(any(FarmerProfile.class));
    }

    @Test
    void testCreateProfileInvalidAadhaarThrowsException() {
        profileDTO.setAadhaarNumber("12345"); // Invalid length
        when(userRepository.findById(1L)).thenReturn(Optional.of(farmer));

        assertThrows(InvalidAadhaarException.class, () -> farmerProfileService.createOrUpdateProfile(1L, profileDTO));
    }

    @Test
    void testGetProfileByUserIdNotFound() {
        when(farmerProfileRepository.findByUserId(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> farmerProfileService.getProfileByUserId(99L));
    }
}
