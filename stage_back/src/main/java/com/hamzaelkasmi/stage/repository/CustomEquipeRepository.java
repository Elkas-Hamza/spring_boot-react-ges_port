package com.hamzaelkasmi.stage.repository;

import jakarta.persistence.EntityManager;

public interface CustomEquipeRepository {
    /**
     * Returns the EntityManager for performing custom database operations.
     * @return The EntityManager instance
     */
    EntityManager getEntityManager();
} 