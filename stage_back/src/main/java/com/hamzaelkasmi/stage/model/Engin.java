package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "engin")
public class Engin {
    @Id
    @GeneratedValue(generator = "engin-id")
    @GenericGenerator(name = "engin-id", strategy = "com.hamzaelkasmi.stage.generateure.EnginIdGenerator")
    @Column(name = "ID_engin")
    private String id_engin;

    @Column(name = "NOM_engin", nullable = false, length = 45)
    private String nom_engin;

    // Constructors
    public Engin() {
    }

    public Engin(String nom_engin) {
        this.nom_engin = nom_engin;
    }

    // Getters and Setters
    public String getId_engin() {
        return id_engin;
    }

    public void setId_engin(String id_engin) {
        this.id_engin = id_engin;
    }

    public String getNom_engin() {
        return nom_engin;
    }

    public void setNom_engin(String nom_engin) {
        this.nom_engin = nom_engin;
    }

    @Override
    public String toString() {
        return "Engin{" +
                "id_engin='" + id_engin + '\'' +
                ", nom_engin='" + nom_engin + '\'' +
                '}';
    }
} 