package com.examly.springapp.controller;
import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.FarmerProfileDTO;
import com.examly.springapp.service.FarmerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer-profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FarmerProfileController {

    private final FarmerProfileService farmerProfileService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<FarmerProfileDTO>> createOrUpdateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody FarmerProfileDTO dto) {
        FarmerProfileDTO response = farmerProfileService.createOrUpdateProfile(userId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Farmer profile saved successfully", response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<FarmerProfileDTO>> getProfileByUserId(@PathVariable Long userId) {
        FarmerProfileDTO response = farmerProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Farmer profile fetched successfully", response));
    }
}
