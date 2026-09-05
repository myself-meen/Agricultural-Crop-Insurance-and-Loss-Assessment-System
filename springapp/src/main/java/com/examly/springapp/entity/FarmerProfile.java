package com.examly.springapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "farmer_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "aadhaar_number", unique = true, nullable = false)
    private String aadhaarNumber;

    @Column(name = "bank_account_no", nullable = false, length = 18)
    private String bankAccountNo;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(nullable = false, length = 50)
    private String district;

    @Column(nullable = false, length = 6)
    private String pincode;
}
