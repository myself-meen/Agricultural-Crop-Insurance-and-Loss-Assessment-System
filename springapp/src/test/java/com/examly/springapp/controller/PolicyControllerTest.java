package com.examly.springapp.controller;

import com.examly.springapp.dto.PolicyDTO;
import com.examly.springapp.entity.PolicyStatus;
import com.examly.springapp.entity.Season;
import com.examly.springapp.service.PolicyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PolicyService policyService;

    @Test
    @WithMockUser(roles = "FARMER")
    void testEnrollPolicy() throws Exception {
        PolicyDTO request = new PolicyDTO();
        request.setKhasraSurveyNo("KH-1024");
        request.setState("Maharashtra");
        request.setDistrict("Pune");
        request.setCropName("Paddy/Rice");
        request.setSeason(Season.KHARIF);
        request.setCropYear(2026);
        request.setSownAreaHa(new BigDecimal("2.50"));

        PolicyDTO response = new PolicyDTO();
        response.setId(10L);
        response.setFarmerId(1L);
        response.setKhasraSurveyNo("KH-1024");
        response.setCropName("Paddy/Rice");
        response.setSumInsured(new BigDecimal("125000.00"));
        response.setStatus(PolicyStatus.ENROLLED);

        when(policyService.enrollPolicy(eq(1L), any(PolicyDTO.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/policies/enroll/farmer/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.cropName").value("Paddy/Rice"));
    }

    @Test
    @WithMockUser(roles = "FARMER")
    void testGetPoliciesByFarmer() throws Exception {
        PolicyDTO response = new PolicyDTO();
        response.setId(10L);
        response.setKhasraSurveyNo("KH-1024");

        when(policyService.getPoliciesByFarmer(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/policies/farmer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(10));
    }
}
