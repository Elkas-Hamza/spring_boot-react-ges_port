package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

public class OperationIdGenerator implements IdentifierGenerator {

    private static int counter = 1; // Static counter to ensure uniqueness

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Generate a unique identifier in the format OP-XXX
        return "OP-" + String.format("%03d", counter++);
    }
} 