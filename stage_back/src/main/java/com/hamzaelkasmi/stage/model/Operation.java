package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "operation")
public class Operation {
    @Id
    @GeneratedValue(generator = "operation-id")
    @GenericGenerator(name = "operation-id", strategy = "com.hamzaelkasmi.stage.generateure.OperationIdGenerator")
    @Column(name = "ID_operation")
    private String id_operation;

    @Column(name = "ID_shift")
    private String id_shift;

    @Column(name = "ID_escale", nullable = false)
    private String id_escale;

    @Column(name = "ID_conteneure", columnDefinition = "TEXT")
    private String id_conteneure;

    @Column(name = "ID_engin", columnDefinition = "TEXT")
    private String id_engin;
    
    @Column(name = "ID_equipe", nullable = false)
    private String id_equipe;

    @Column(name = "DATE_debut", nullable = false)
    private LocalDateTime date_debut;

    @Column(name = "DATE_fin", nullable = false)
    private LocalDateTime date_fin;

    @Column(name = "status")
    private String status = "En cours";
    
    @Column(name = "TYPE_operation")
    private String type_operation = "AUTRE";

    // Constructors
    public Operation() {
    }

    public Operation(String id_shift, String id_escale, String id_conteneure, 
                    String id_engin, String id_equipe, 
                    LocalDateTime date_debut, LocalDateTime date_fin, String status,
                    String type_operation) {
        this.id_shift = id_shift;
        this.id_escale = id_escale;
        this.id_conteneure = id_conteneure;
        this.id_engin = id_engin;
        this.id_equipe = id_equipe;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
        this.status = status;
        this.type_operation = type_operation;
    }

    // Getters and Setters
    public String getId_operation() {
        return id_operation;
    }

    public void setId_operation(String id_operation) {
        this.id_operation = id_operation;
    }

    public String getId_shift() {
        return id_shift;
    }

    public void setId_shift(String id_shift) {
        this.id_shift = id_shift;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getType_operation() {
        return type_operation;
    }

    public void setType_operation(String type_operation) {
        this.type_operation = type_operation;
    }

    @Override
    public String toString() {
        return "Operation{" +
                "id_operation='" + id_operation + '\'' +
                ", id_shift='" + id_shift + '\'' +
                ", id_escale='" + id_escale + '\'' +
                ", id_conteneure='" + id_conteneure + '\'' +
                ", id_engin='" + id_engin + '\'' +
                ", id_equipe='" + id_equipe + '\'' +
                ", date_debut=" + date_debut +
                ", date_fin=" + date_fin +
                ", status='" + status + '\'' +
                ", type_operation='" + type_operation + '\'' +
                '}';
    }
} 