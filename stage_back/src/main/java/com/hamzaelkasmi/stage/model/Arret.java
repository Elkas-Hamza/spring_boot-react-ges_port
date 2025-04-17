package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Table(name = "arret")
public class Arret {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_arret")
    private int ID_arret;

    @Column(name = "NUM_escale", nullable = false)
    private int NUM_escale;

    @Column(name = "MOTIF_arret", nullable = false, length = 256)
    private String MOTIF_arret;

    @Column(name = "DURE_arret", nullable = false)
    private int DURE_arret;

    @Column(name = "DATE_DEBUT_arret", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime DATE_DEBUT_arret;

    @Column(name = "DATE_FIN_arret", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime DATE_FIN_arret;

    // Getters and Setters
    public int getID_arret() {
        return ID_arret;
    }

    public void setID_arret(int ID_arret) {
        this.ID_arret = ID_arret;
    }

    public int getNUM_escale() {
        return NUM_escale;
    }

    public void setNUM_escale(int NUM_escale) {
        this.NUM_escale = NUM_escale;
    }

    public String getMOTIF_arret() {
        return MOTIF_arret;
    }

    public void setMOTIF_arret(String MOTIF_arret) {
        this.MOTIF_arret = MOTIF_arret;
    }

    public int getDURE_arret() {
        return DURE_arret;
    }

    public void setDURE_arret(int DURE_arret) {
        this.DURE_arret = DURE_arret;
    }

    public LocalDateTime getDATE_DEBUT_arret() {
        return DATE_DEBUT_arret;
    }

    public void setDATE_DEBUT_arret(LocalDateTime DATE_DEBUT_arret) {
        this.DATE_DEBUT_arret = DATE_DEBUT_arret;
    }

    public LocalDateTime getDATE_FIN_arret() {
        return DATE_FIN_arret;
    }

    public void setDATE_FIN_arret(LocalDateTime DATE_FIN_arret) {
        this.DATE_FIN_arret = DATE_FIN_arret;
    }
}