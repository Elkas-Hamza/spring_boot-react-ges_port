package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.SystemMetrics;
import com.hamzaelkasmi.stage.service.PerformanceMonitoringService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PerformanceMonitoringControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PerformanceMonitoringService performanceService;

    @Test
    public void testGetSystemMetrics() throws Exception {
        SystemMetrics mockMetrics = new SystemMetrics();
        mockMetrics.setCpu(25.5);
        mockMetrics.setMemory(40.2);
        mockMetrics.setActiveConnections(5);
        mockMetrics.setUptime(3600);
        
        SystemMetrics.DiskSpace diskSpace = new SystemMetrics.DiskSpace();
        diskSpace.setTotal(500000);
        diskSpace.setUsed(200000);
        diskSpace.setFree(300000);
        mockMetrics.setDiskSpace(diskSpace);
        
        when(performanceService.getSystemMetrics()).thenReturn(mockMetrics);
        
        mockMvc.perform(get("/api/monitoring/system-metrics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpu").value(25.5))
                .andExpect(jsonPath("$.memory").value(40.2))
                .andExpect(jsonPath("$.activeConnections").value(5))
                .andExpect(jsonPath("$.diskSpace.total").value(500000));
    }
    
    @Test
    public void testEnableMonitoring() throws Exception {
        when(performanceService.isMonitoringEnabled()).thenReturn(true);
        
        mockMvc.perform(post("/api/monitoring/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"enabled\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }
    
    @Test
    public void testGetAlerts() throws Exception {
        when(performanceService.getAlerts()).thenReturn(Collections.emptyList());
        
        mockMvc.perform(get("/api/monitoring/alerts")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
    
    @Test
    public void testGetMonitoringStatus() throws Exception {
        when(performanceService.isMonitoringEnabled()).thenReturn(true);
        
        mockMvc.perform(get("/api/monitoring/status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }
}
