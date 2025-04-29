package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class EquipeIdGenerator implements IdentifierGenerator {

    private DataSource dataSource;

    public EquipeIdGenerator() {
    }

    @Override
    public Object generate(SharedSessionContractImplementor session, Object object) {
        Connection connection = null;
        try {
            connection = session.getJdbcConnectionAccess().obtainConnection();
            
            // Insert a new row into the counter table
            PreparedStatement ps = connection.prepareStatement("INSERT INTO equipe_counter VALUES ()", PreparedStatement.RETURN_GENERATED_KEYS);
            ps.executeUpdate();

            // Get the generated ID
            var rs = ps.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                // Format the ID with padding
                return String.format("EQ-%03d", id);
            } else {
                throw new RuntimeException("Failed to generate ID for equipe");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error generating equipe ID", e);
        } finally {
            if (connection != null) {
                try {
                    session.getJdbcConnectionAccess().releaseConnection(connection);
                } catch (SQLException ignored) {
                    // Ignore exception during connection release
                }
            }
        }
    }
} 