package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import java.io.Serializable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ArretIdGenerator implements IdentifierGenerator {

    private static int counter = -1; // Will be initialized on first use

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Initialize counter if not done yet or if application was restarted
        if (counter < 0) {
            counter = getHighestArretIdValue(session) + 1;
        }

        // Generate a unique identifier in the format AR-XXX
        return "AR-" + String.format("%03d", counter++);
    }

    private int getHighestArretIdValue(SharedSessionContractImplementor session) {
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet resultSet = null;
        int highest = 0;

        try {
            connection = session.getJdbcConnectionAccess().obtainConnection();
            statement = connection.prepareStatement("SELECT ID_arret FROM arret");
            resultSet = statement.executeQuery();

            Pattern pattern = Pattern.compile("AR-(\\d+)");

            while (resultSet.next()) {
                String currentId = resultSet.getString(1);
                if (currentId != null) {
                    Matcher matcher = pattern.matcher(currentId);
                    if (matcher.find()) {
                        try {
                            int num = Integer.parseInt(matcher.group(1));
                            highest = Math.max(highest, num);
                        } catch (NumberFormatException e) {
                            // Skip malformed IDs
                        }
                    }
                }
            }

            System.out.println("ArretIdGenerator initialized with highest ID: AR-" + String.format("%03d", highest));
            return highest;

        } catch (SQLException e) {
            System.err.println("Error in ArretIdGenerator while getting highest arret ID: " + e.getMessage());
            // In case of error, start from a safe high number
            return 1000;
        } finally {
            if (resultSet != null)
                try {
                    resultSet.close();
                } catch (SQLException e) {
                }
            if (statement != null)
                try {
                    statement.close();
                } catch (SQLException e) {
                }
            if (connection != null)
                try {
                    connection.close();
                } catch (SQLException e) {
                }
        }
    }
}