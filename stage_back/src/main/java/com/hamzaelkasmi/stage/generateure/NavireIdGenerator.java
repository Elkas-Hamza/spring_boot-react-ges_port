package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.hibernate.query.Query;

import java.io.Serializable;

public class NavireIdGenerator implements IdentifierGenerator {

    private static Integer maxId = null; // Cache for the maximum ID

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Initialize the counter only once by checking the database
        if (maxId == null) {
            synchronized (NavireIdGenerator.class) {
                if (maxId == null) {
                    // Query the database to find the highest existing ID
                    String sql = "SELECT MAX(CAST(SUBSTRING(ID_navire, 5) AS UNSIGNED)) FROM navire WHERE ID_navire LIKE 'NAV-%'";
                    Query<Integer> query = session.createNativeQuery(sql, Integer.class);
                    Integer result = query.uniqueResult();
                    maxId = (result != null) ? result : 0;
                }
            }
        }

        // Increment and generate the next ID
        return "NAV-" + String.format("%03d", ++maxId);
    }
}