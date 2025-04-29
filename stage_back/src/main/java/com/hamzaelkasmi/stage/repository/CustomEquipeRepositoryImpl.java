package com.hamzaelkasmi.stage.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class CustomEquipeRepositoryImpl implements CustomEquipeRepository {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public EntityManager getEntityManager() {
        return entityManager;
    }
} 