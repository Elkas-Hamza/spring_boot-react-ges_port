package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

public class EnginIdGenerator implements IdentifierGenerator {

    private static int counter = 1; // Static counter to ensure uniqueness

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Generate a unique identifier in the format EN-XXX
        return "EN-" + String.format("%03d", counter++);
    }
} 