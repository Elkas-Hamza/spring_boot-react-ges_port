package com.hamzaelkasmi.stage.generateure;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class EnginIdGenerator implements IdentifierGenerator {

    public EnginIdGenerator() {
    }

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        Connection connection = null;
        try {
            connection = session.getJdbcConnectionAccess().obtainConnection();

            // Insert a new row into the counter table to get the next ID
            PreparedStatement ps = connection.prepareStatement("INSERT INTO engin_counter VALUES ()",
                    PreparedStatement.RETURN_GENERATED_KEYS);
            ps.executeUpdate();

            // Get the generated ID
            var rs = ps.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                // Format the ID with padding
                return String.format("EN-%03d", id);
            } else {
                throw new HibernateException("Failed to generate ID for engin");
            }
        } catch (SQLException e) {
            throw new HibernateException("Error generating engin ID", e);
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