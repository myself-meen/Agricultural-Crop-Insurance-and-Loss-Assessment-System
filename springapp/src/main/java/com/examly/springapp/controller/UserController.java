package com.examly.springapp.controller;
import com.examly.springapp.dto.ApiResponse;
import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.UserDTO;
import com.examly.springapp.entity.Role;
import com.examly.springapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched successfully", userService.getAllUsers()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", userService.getUserById(id)));
    }
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched by role successfully", userService.getUsersByRole(role)));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<AuthResponse>> createUser(@jakarta.validation.Valid @RequestBody com.examly.springapp.dto.RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", userService.updateUser(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deactivated successfully", null));
    }
}
