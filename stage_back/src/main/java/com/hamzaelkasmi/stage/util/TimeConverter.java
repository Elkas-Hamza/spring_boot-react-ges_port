package com.hamzaelkasmi.stage.util;

import java.time.DateTimeException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Utility class for converting string time formats to LocalTime objects
 */
public class TimeConverter {

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter[] FORMATTERS = {
            DateTimeFormatter.ofPattern("HH:mm"),
            DateTimeFormatter.ofPattern("H:mm"),
            DateTimeFormatter.ofPattern("HH:mm:ss"),
            DateTimeFormatter.ISO_LOCAL_TIME
    };

    /**
     * Converts a string representation of time to LocalTime
     * Attempts multiple common formats
     * 
     * @param timeString the string to convert
     * @return the LocalTime representation, or null if conversion failed
     */
    public static LocalTime parseTimeString(String timeString) {
        if (timeString == null || timeString.trim().isEmpty()) {
            return null;
        }

        // Try all formatters
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalTime.parse(timeString.trim(), formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
            }
        }

        // Try parsing as hour and minute values
        try {
            String[] parts = timeString.split(":");
            if (parts.length >= 2) {
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);
                return LocalTime.of(hour, minute);
            }
        } catch (NumberFormatException | DateTimeException e) {
            // Ignore and return null
        }

        return null;
    }

    /**
     * Format a LocalTime to the standard format (HH:mm)
     */
    public static String formatTime(LocalTime time) {
        if (time == null) {
            return null;
        }
        return time.format(DEFAULT_FORMATTER);
    }
}
