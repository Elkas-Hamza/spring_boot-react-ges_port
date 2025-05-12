package com.hamzaelkasmi.stage.generateure;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

public class EscaleIdGenerator implements IdentifierGenerator {

    private static int counter = 1;

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        // Generate a unique identifier in the format ESC-XXX
        return "E7C-" + String.format("%03d", counter++);
    }
}