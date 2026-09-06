package com.examly.springapp.service;

import com.examly.springapp.audit.AuditService;
import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.dto.UserDTO;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.InvalidNameException;
import com.examly.springapp.exception.InvalidPhoneException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.exception.UnauthorisedAccessException;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;
    public AuthResponse register(RegisterRequest request) {
        if (!request.getName().matches("^[a-zA-Z\\s]+$")) {
            throw new InvalidNameException("Name must contain alphabets and spaces only");
        }
        if (!request.getPhoneNumber().matches("^\\d{10}$")) {
            throw new InvalidPhoneException("Phone number must be exactly 10 digits");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number is already registered");
        }

        Role requestedRole = request.getRole() != null ? request.getRole() : Role.FARMER;
        // Restrict ADMIN role self-registration:
        if (requestedRole == Role.ADMIN) {
            throw new UnauthorisedAccessException("Direct registration for ADMIN role is not permitted. Contact system administrator.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(requestedRole);
        user.setIsActive(true);
        user.setCreatedDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        auditService.logAction(savedUser.getId(), "USER_REGISTER", "USER", savedUser.getId(),
                "Registered new user with role: " + savedUser.getRole(), "127.0.0.1");
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, "Bearer", savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .orElseGet(() -> userRepository.findByPhoneNumber(request.getIdentifier())
                        .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid credentials")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new IllegalArgumentException("Account is inactive. Please contact system administrator.");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        auditService.logAction(user.getId(), "USER_LOGIN", "USER", user.getId(),
                "User logged in successfully", "127.0.0.1");

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, "Bearer", user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return convertToDTO(user);
    }

    public List<UserDTO> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (dto.getName() != null) {
            if (!dto.getName().matches("^[a-zA-Z\\s]+$")) {
                throw new InvalidNameException("Name must contain alphabets and spaces only");
            }
            user.setName(dto.getName());
        }
        if (dto.getPhoneNumber() != null) {
            if (!dto.getPhoneNumber().matches("^\\d{10}$")) {
                throw new InvalidPhoneException("Phone number must be exactly 10 digits");
            }
            user.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }

        User updated = userRepository.save(user);
        auditService.logAction(id, "USER_UPDATED", "USER", id, "Updated user details", "127.0.0.1");
        return convertToDTO(updated);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setIsActive(false);
        userRepository.save(user);
        auditService.logAction(id, "USER_DEACTIVATED", "USER", id, "Deactivated user account", "127.0.0.1");
    }

    public UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedDate(user.getCreatedDate());
        dto.setLastLogin(user.getLastLogin());
        dto.setIsActive(user.getIsActive());
        return dto;
    }
}
