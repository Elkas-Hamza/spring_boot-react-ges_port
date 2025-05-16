package com.hamzaelkasmi.stage.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        
        // General settings
        settings.put("general", new HashMap<String, Object>() {{
            put("siteName", "Système de Management des Ports");
            put("adminEmail", "admin@marsamaroc.co.ma");
            put("timezone", "Africa/Casablanca");
            put("language", "fr");
            put("dateFormat", "DD/MM/YYYY");
            put("timeFormat", "24h");
        }});
        
        // Security settings
        settings.put("security", new HashMap<String, Object>() {{
            put("passwordMinLength", 8);
            put("passwordRequireUppercase", true);
            put("passwordRequireNumbers", true);
            put("passwordRequireSymbols", true);
            put("sessionTimeout", 60);
            put("loginAttempts", 5);
            put("twoFactorAuth", false);
        }});
        
        // Email settings
        settings.put("email", new HashMap<String, Object>() {{
            put("smtpServer", "smtp.marsamaroc.co.ma");
            put("smtpPort", 587);
            put("smtpUsername", "notifications@marsamaroc.co.ma");
            put("smtpSecure", true);
            put("senderName", "Système de Management des Ports");
            put("senderEmail", "no-reply@marsamaroc.co.ma");
        }});
        
        // Notifications settings
        settings.put("notifications", new HashMap<String, Object>() {{
            put("emailNotifications", true);
            put("operationCreated", true);
            put("operationUpdated", true);
            put("escaleCreated", true);
            put("userAccountCreated", true);
            put("systemErrors", true);
        }});
        
        // Backup settings
        settings.put("backup", new HashMap<String, Object>() {{
            put("autoBackup", true);
            put("backupFrequency", "daily");
            put("backupTime", "03:00");
            put("retentionDays", 30);
            put("backupLocation", "/backup");
        }});
        
        // Performance settings
        settings.put("performance", new HashMap<String, Object>() {{
            put("enableMonitoring", true);
            put("autoStartMonitoring", false);
            put("dataRetentionDays", 7);
            put("maxDataPoints", 100);
            put("monitoringRefreshInterval", 5000);
            put("alertOnSlowResponses", true);
            put("slowResponseThreshold", 5000);
        }});
        
        return settings;
    }
    
    @PutMapping
    public Map<String, Object> saveSettings(@RequestBody Map<String, Object> settings) {
        // In a real application, you would save these settings to a database
        // For now, we'll just return the same settings as if they were saved
        return settings;
    }
}
