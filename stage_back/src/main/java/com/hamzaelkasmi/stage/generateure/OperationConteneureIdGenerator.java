package com.hamzaelkasmi.stage.generateure;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class OperationConteneureIdGenerator implements IdentifierGenerator {
    private static final String PREFIX = "OPC-";
    private static final int MIN_VALUE = 1;
    private static final int PADDING_LENGTH = 3;

    @Override
    public Object generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        Connection connection = null;
        try {
            connection = session.getJdbcConnectionAccess().obtainConnection();
            
            // Check if a record with this ID already exists to avoid duplicates
            Statement statement = connection.createStatement();
            
            // Get the next value from operation_conteneure_counter
            JdbcTemplate jdbcTemplate = new JdbcTemplate(new SingleConnectionDataSource(connection, false));
            jdbcTemplate.execute("INSERT INTO operation_conteneure_counter VALUES ()");
            ResultSet rs = statement.executeQuery("SELECT LAST_INSERT_ID()");
            
            int nextValue = MIN_VALUE;
            if (rs.next()) {
                nextValue = rs.getInt(1);
            }
            rs.close();
            
            // Format the ID with padding
            String paddedId = String.format("%0" + PADDING_LENGTH + "d", nextValue);
            return PREFIX + paddedId;
            
        } catch (SQLException e) {
            throw new HibernateException("Unable to generate Operation Conteneure ID", e);
        } finally {
            try {
                if (connection != null) {
                    session.getJdbcConnectionAccess().releaseConnection(connection);
                }
            } catch (SQLException e) {
                throw new HibernateException("Unable to release JDBC connection", e);
            }
        }
    }
} 