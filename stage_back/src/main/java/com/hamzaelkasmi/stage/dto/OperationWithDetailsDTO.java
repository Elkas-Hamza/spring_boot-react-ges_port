package com.hamzaelkasmi.stage.dto;

import java.time.LocalDateTime;

public class OperationWithDetailsDTO {
    private String id_operation;
    private String nom_operation;
    private String id_shift;
    private String nom_shift;
    private String id_escale;
    private String id_conteneure;
    private String id_engin;
    private String id_equipe;
    private LocalDateTime date_debut;
    private LocalDateTime date_fin;

    // Default constructor
    public OperationWithDetailsDTO() {
    }

    // Getters and Setters
    public String getId_operation() {
        return id_operation;
    }

    public void setId_operation(String id_operation) {
        this.id_operation = id_operation;
    }

    public String getNom_operation() {
        return nom_operation;
    }

    public void setNom_operation(String nom_operation) {
        this.nom_operation = nom_operation;
    }

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

    public String getId_escale() {
        return id_escale;
    }

    public void setId_escale(String id_escale) {
        this.id_escale = id_escale;
    }

    public String getId_conteneure() {
        return id_conteneure;
    }

    public void setId_conteneure(String id_conteneure) {
        this.id_conteneure = id_conteneure;
    }

    public String getId_engin() {
        return id_engin;
    }

    public void setId_engin(String id_engin) {
        this.id_engin = id_engin;
    }

    public String getId_equipe() {
        return id_equipe;
    }

    public void setId_equipe(String id_equipe) {
        this.id_equipe = id_equipe;
    }

    public LocalDateTime getDate_debut() {
        return date_debut;
    }

    public void setDate_debut(LocalDateTime date_debut) {
        this.date_debut = date_debut;
    }

    public LocalDateTime getDate_fin() {
        return date_fin;
    }

    public void setDate_fin(LocalDateTime date_fin) {
        this.date_fin = date_fin;
    }
} 