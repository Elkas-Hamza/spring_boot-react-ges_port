package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalTime;

@Entity
@Table(name = "shift")
public class Shift {
    @Id
    @GeneratedValue(generator = "shift-id")
    @GenericGenerator(name = "shift-id", strategy = "com.hamzaelkasmi.stage.generateure.ShiftIdGenerator")
    @Column(name = "ID_shift")
    private String id_shift;

    @Column(name = "NOM_shift")
    private String nom_shift;

    @Column(name = "HEURE_debut", nullable = false)
    private LocalTime heure_debut;

    @Column(name = "HEURE_fin", nullable = false)
    private LocalTime heure_fin;

    // Constructors
    public Shift() {
    }

    public Shift(String nom_shift, LocalTime heure_debut, LocalTime heure_fin) {
        this.nom_shift = nom_shift;
        this.heure_debut = heure_debut;
        this.heure_fin = heure_fin;
    }

    // Getters and Setters
    public String getId_shift() {
        return id_shift;
    }

    public void setId_shift(String id_shift) {
        this.id_shift = id_shift;
    }

    public String getNom_shift() {
        return nom_shift;
    }

    public void setNom_shift(String nom_shift) {
        this.nom_shift = nom_shift;
    }

    public LocalTime getHeure_debut() {
        return heure_debut;
    }

    public void setHeure_debut(LocalTime heure_debut) {
        this.heure_debut = heure_debut;
    }

    public LocalTime getHeure_fin() {
        return heure_fin;
    }

    public void setHeure_fin(LocalTime heure_fin) {
        this.heure_fin = heure_fin;
    }

    @Override
    public String toString() {
        return "Shift{" +
                "id_shift='" + id_shift + '\'' +
                ", nom_shift='" + nom_shift + '\'' +
                ", heure_debut=" + heure_debut +
                ", heure_fin=" + heure_fin +
                '}';
    }
} 