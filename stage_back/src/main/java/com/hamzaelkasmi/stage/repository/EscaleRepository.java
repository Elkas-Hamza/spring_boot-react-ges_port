package com.hamzaelkasmi.stage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hamzaelkasmi.stage.model.Escale;

@Repository
public interface EscaleRepository extends JpaRepository<Escale, Integer> {
}