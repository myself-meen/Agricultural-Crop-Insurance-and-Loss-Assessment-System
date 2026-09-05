package com.examly.springapp.config;

import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUser("Admin User", "9999999999", "admin@cropinsure.gov.in", "Admin@123", Role.ADMIN);
            seedUser("Farmer Ramesh", "9876543210", "ramesh@farmer.in", "Farmer@123", Role.FARMER);
            seedUser("Insurer Officer", "9876543211", "officer@insurer.com", "Insurer@123", Role.INSURER);
            seedUser("Surveyor Officer", "9876543212", "surveyor@assess.gov.in", "Surveyor@123", Role.SURVEYOR);
            seedUser("Bank Officer", "9876543213", "bank@officer.in", "Bank@123", Role.BANK_OFFICER);
            seedUser("State Officer", "9876543214", "state@officer.gov.in", "State@123", Role.STATE_OFFICER);
            System.out.println("✅ DataSeeder initialized default users successfully.");
        }
    }

    private void seedUser(String name, String phone, String email, String password, Role role) {
        User user = new User();
        user.setName(name);
        user.setPhoneNumber(phone);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setIsActive(true);
        user.setCreatedDate(LocalDateTime.now());
        userRepository.save(user);
    }
}
