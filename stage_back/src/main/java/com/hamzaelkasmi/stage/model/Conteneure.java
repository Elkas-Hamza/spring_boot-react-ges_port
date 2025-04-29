package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "conteneure")
public class Conteneure {
    @Id
    @GeneratedValue(generator = "conteneure-id")
    @GenericGenerator(name = "conteneure-id", strategy = "com.hamzaelkasmi.stage.generateure.ConteneureIdGenerator")
    @Column(name = "ID_conteneure")
    private String id_conteneure;

    @Column(name = "NOM_conteneure", nullable = false, length = 45)
    private String nom_conteneure;

    // Constructors
    public Conteneure() {
    }

    public Conteneure(String nom_conteneure) {
        this.nom_conteneure = nom_conteneure;
    }

    // Getters and Setters
    public String getId_conteneure() {
        return id_conteneure;
    }

    public void setId_conteneure(String id_conteneure) {
        this.id_conteneure = id_conteneure;
    }

    public String getNom_conteneure() {
        return nom_conteneure;
    }

    public void setNom_conteneure(String nom_conteneure) {
        this.nom_conteneure = nom_conteneure;
    }

    @Override
    public String toString() {
        return "Conteneure{" +
                "id_conteneure='" + id_conteneure + '\'' +
                ", nom_conteneure='" + nom_conteneure + '\'' +
                '}';
    }
} 