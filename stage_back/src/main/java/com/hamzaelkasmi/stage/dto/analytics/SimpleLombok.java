package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Use these simple alternatives to the Lombok annotations if needed
 */
public class SimpleLombok {
    // These are marker interfaces to replace Lombok annotations
    // They don't do anything programmatically, but provide documentation
    
    /**
     * Use this interface to mark classes that should have getters and setters
     * Then manually implement the required methods
     */
    public interface Data {
    }
    
    /**
     * Use this interface to mark classes that should have a no-args constructor
     * Then manually implement the constructor
     */
    public interface NoArgsConstructor {
    }
    
    /**
     * Use this interface to mark classes that should have an all-args constructor
     * Then manually implement the constructor
     */
    public interface AllArgsConstructor {
    }
} 