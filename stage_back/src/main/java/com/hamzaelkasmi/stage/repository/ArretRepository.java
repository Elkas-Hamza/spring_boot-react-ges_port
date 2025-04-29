package com.hamzaelkasmi.stage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hamzaelkasmi.stage.model.Arret;

@Repository
public interface ArretRepository extends JpaRepository<Arret, String> {

}