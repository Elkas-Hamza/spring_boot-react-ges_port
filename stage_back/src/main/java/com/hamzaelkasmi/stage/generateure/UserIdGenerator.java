package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.util.concurrent.atomic.AtomicInteger;

public class UserIdGenerator implements IdentifierGenerator {

    // Using AtomicInteger to ensure thread safety
    private static final AtomicInteger counter = new AtomicInteger(1);

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Generate a unique identifier in the format USR-XXX
        return "USR-" + String.format("%03d", counter.getAndIncrement());
    }
} 