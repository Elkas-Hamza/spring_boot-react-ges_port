package com.hamzaelkasmi.stage.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    @GetMapping
    public Map<String, Object> getSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("performance", new HashMap<String, Object>() {{
            put("maxDataPoints", 100);
            put("alertOnSlowResponses", true);
            put("slowResponseThreshold", 5000);
            put("autoStartMonitoring", false);
        }});
        return settings;
    }
}
