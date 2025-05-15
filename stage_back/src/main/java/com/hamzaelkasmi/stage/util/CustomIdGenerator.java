package com.hamzaelkasmi.stage.util;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.concurrent.ConcurrentHashMap;

public class CustomIdGenerator implements IdentifierGenerator {
    
    private static final ConcurrentHashMap<String, Integer> counters = new ConcurrentHashMap<>();    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        String entityName = object.getClass().getSimpleName();
        String prefix = entityName.substring(0, 3).toUpperCase(); // First 3 letters of entity name
        
        Connection connection = null;
        try {
            connection = session.getJdbcConnectionAccess().obtainConnection();
            Integer nextId = getNextId(prefix, entityName, connection);
            
            // Format: XXX-NNNN (e.g., PER-001 for Personnel, SOU-001 for Soustraiteure)
            return String.format("%s-%03d", prefix, nextId);
        } catch (SQLException e) {
            throw new HibernateException("Unable to generate ID", e);
        } finally {
            if (connection != null) {
                try {
                    session.getJdbcConnectionAccess().releaseConnection(connection);
                } catch (SQLException e) {
                    // Log error but continue
                }
            }
        }
    }
    private Integer getNextId(String prefix, String entityName, Connection connection) {
        String key = prefix + "-counter";
        
        // If counter doesn't exist yet in our map, try to find the max from the database
        if (!counters.containsKey(key)) {
            PreparedStatement ps = null;
            ResultSet rs = null;
            
            try {
                String tableName = entityName.toLowerCase();
                String idColumnName = "MATRICULE_" + tableName;
                
                // Get the current max ID for this entity type
                String query;
                
                try {
                    // Try to determine the database type
                    String dbName = connection.getMetaData().getDatabaseProductName().toLowerCase();
                    if (dbName.contains("mysql")) {
                        // MySQL syntax
                        query = "SELECT MAX(CAST(SUBSTRING_INDEX(" + idColumnName + ", '-', -1) AS UNSIGNED)) " +
                               "FROM " + tableName + " WHERE " + idColumnName + " LIKE '" + prefix + "-%'";
                    } else if (dbName.contains("h2")) {
                        // H2 syntax
                        query = "SELECT MAX(CAST(SUBSTRING(" + idColumnName + ", LENGTH('" + prefix + "-') + 1) AS INT)) " +
                               "FROM " + tableName + " WHERE " + idColumnName + " LIKE '" + prefix + "-%'";
                    } else {
                        // Generic approach for PostgreSQL and others
                        query = "SELECT MAX(CAST(SUBSTRING(" + idColumnName + " FROM LENGTH('" + prefix + "-') + 1) AS INT)) " +
                               "FROM " + tableName + " WHERE " + idColumnName + " LIKE '" + prefix + "-%'";
                    }
                } catch (SQLException e) {
                    // Fallback to a simpler query that just gets the max value
                    query = "SELECT MAX(" + idColumnName + ") FROM " + tableName;
                }
                
                ps = connection.prepareStatement(query);
                rs = ps.executeQuery();
                
                Integer maxId = null;
                if (rs.next()) {
                    String value = rs.getString(1);
                    if (value != null) {
                        try {
                            // If we got a full ID like "PER-0001", extract just the number part
                            if (value.contains("-")) {
                                value = value.substring(value.indexOf("-") + 1);
                            }
                            maxId = Integer.parseInt(value);
                        } catch (NumberFormatException nfe) {
                            // If we can't parse it, start from 0
                            maxId = 0;
                        }
                    }
                }
                
                counters.put(key, maxId != null ? maxId : 0);
            } catch (SQLException e) {
                // If query fails (e.g., table doesn't exist yet), start from 0
                counters.put(key, 0);
            } finally {
                // Always close resources to prevent leaks
                try {
                    if (rs != null) rs.close();
                    if (ps != null) ps.close();
                } catch (SQLException e) {
                    // Log error but continue
                }
            }
        }
        
        // Increment and return the next ID
        return counters.compute(key, (k, v) -> v == null ? 1 : v + 1);
    }
}
