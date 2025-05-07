package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

public class NavireIdGenerator implements IdentifierGenerator {

    private static int counter = 1; // Static counter to ensure uniqueness

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Generate a unique identifier in the format NAV-XXX
        return "NAV-" + String.format("%03d", counter++);
    }
} 