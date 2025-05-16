package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.Serializable;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class SoustraiteureIdGenerator implements IdentifierGenerator {

    private static AtomicInteger counter;
    private static boolean initialized = false;
    
    // Use shared static JDBC template for database operations
    private static JdbcTemplate jdbcTemplate;

    @Autowired
    public void setDataSource(DataSource dataSource) {
        jdbcTemplate = new JdbcTemplate(dataSource);
        initCounter();
    }

    // Initialize the counter based on the highest existing ID in the database
    private synchronized void initCounter() {
        // Only initialize once
        if (initialized) {
            return;
        }
        
        if (jdbcTemplate != null) {
            try {
                // Query the max numeric part of ID and increment by 1
                Integer maxId = jdbcTemplate.queryForObject(
                        "SELECT MAX(CAST(SUBSTRING(MATRICULE_soustraiteure, 5) AS UNSIGNED)) FROM Soustraiteure",
                        Integer.class);
                
                // If we have existing IDs, start from the next available number
                int nextId = (maxId != null) ? maxId + 1 : 1;
                counter = new AtomicInteger(nextId);
                initialized = true;
            } catch (Exception e) {
                // Fallback in case of any error
                counter = new AtomicInteger(1000); // Start from a high number to avoid conflicts
                initialized = true;
                e.printStackTrace();
            }
        } else {
            // If jdbcTemplate is not available (unlikely), use a safe default
            counter = new AtomicInteger(1000); // Start from a high number to avoid conflicts
            initialized = true;
        }
    }

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Ensure counter is initialized
        if (!initialized) {
            counter = new AtomicInteger(1000); // Safe fallback
            initialized = true;
        }
        
        // Generate a unique identifier in the format SOU-XXX
        return "SOU-" + String.format("%03d", counter.getAndIncrement());
    }
}
