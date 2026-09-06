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
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("Ramesh Kumar", "9876543210", "ramesh@farmer.in", "Password@123", Role.FARMER);

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Ramesh Kumar");
        testUser.setPhoneNumber("9876543210");
        testUser.setEmail("ramesh@farmer.in");
        testUser.setPasswordHash("hashed_password");
        testUser.setRole(Role.FARMER);
        testUser.setIsActive(true);
    }

    @Test
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("ramesh@farmer.in")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock_jwt_token");

        AuthResponse response = userService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("ramesh@farmer.in", response.getEmail());
        assertEquals(Role.FARMER, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterInvalidNameThrowsException() {
        registerRequest.setName("Ramesh123");
        assertThrows(InvalidNameException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterInvalidPhoneThrowsException() {
        registerRequest.setPhoneNumber("98765");
        assertThrows(InvalidPhoneException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        when(userRepository.existsByEmail("ramesh@farmer.in")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterDuplicatePhoneThrowsException() {
        when(userRepository.existsByEmail("ramesh@farmer.in")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterAdminRoleThrowsUnauthorisedException() {
        RegisterRequest adminReq = new RegisterRequest("Attacker", "9876543210", "attacker@evil.in", "Password@123", Role.ADMIN);
        when(userRepository.existsByEmail("attacker@evil.in")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(false);
        assertThrows(com.examly.springapp.exception.UnauthorisedAccessException.class, () -> userService.register(adminReq));
    }


    @Test
    void testLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest("ramesh@farmer.in", "Password@123");
        when(userRepository.findByEmail("ramesh@farmer.in")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password@123", "hashed_password")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock_jwt_token");

        AuthResponse response = userService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals(testUser.getEmail(), response.getEmail());
    }

    @Test
    void testLoginInvalidCredentialsThrowsException() {
        LoginRequest loginRequest = new LoginRequest("ramesh@farmer.in", "WrongPassword");
        when(userRepository.findByEmail("ramesh@farmer.in")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.login(loginRequest));
    }

    @Test
    void testLoginUserNotFoundThrowsException() {
        LoginRequest loginRequest = new LoginRequest("unknown@user.in", "Password@123");
        when(userRepository.findByEmail("unknown@user.in")).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber("unknown@user.in")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> userService.login(loginRequest));
    }

    @Test
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        List<UserDTO> users = userService.getAllUsers();
        assertEquals(1, users.size());
        assertEquals("Ramesh Kumar", users.get(0).getName());
    }

    @Test
    void testGetUserByIdSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        UserDTO dto = userService.getUserById(1L);
        assertNotNull(dto);
        assertEquals("Ramesh Kumar", dto.getName());
    }

    @Test
    void testGetUserByIdNotFoundThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void testUpdateUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDTO updateDto = new UserDTO();
        updateDto.setName("Ramesh Patel");
        updateDto.setPhoneNumber("9123456780");

        UserDTO updated = userService.updateUser(1L, updateDto);
        assertNotNull(updated);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testDeleteUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.deleteUser(1L);
        assertFalse(testUser.getIsActive());
        verify(userRepository, times(1)).save(testUser);
    }
}
