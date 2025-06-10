package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "arret")
public class Arret {

    @Id
    @GeneratedValue(generator = "arret-id-generator")
    @org.hibernate.annotations.GenericGenerator(name = "arret-id-generator", strategy = "com.hamzaelkasmi.stage.generateure.ArretIdGenerator")
    @Column(name = "ID_arret", nullable = false, unique = true)
    private String ID_arret;
    @Column(name = "NUM_escale", nullable = false)
    @JsonProperty("NUM_escale")
    private String NUM_escale;

    @Column(name = "ID_operation")
    @JsonProperty("ID_operation")
    private String ID_operation;

    @Column(name = "MOTIF_arret", nullable = false, length = 256)
    @JsonProperty("MOTIF_arret")
    private String MOTIF_arret;

    @Column(name = "DURE_arret", nullable = false)
    @JsonProperty("DURE_arret")
    private int DURE_arret;

    @Column(name = "DATE_DEBUT_arret", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonProperty("DATE_DEBUT_arret")
    private LocalDateTime DATE_DEBUT_arret;

    @Column(name = "DATE_FIN_arret", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonProperty("DATE_FIN_arret")
    private LocalDateTime DATE_FIN_arret;

    // Default constructor required by JPA/Hibernate
    public Arret() {
    }

    // Getters and Setters
    public String getID_arret() {
        return ID_arret;
    }

    public void setID_arret(String ID_arret) {
        this.ID_arret = ID_arret;
    }

    public String getNUM_escale() {
        return NUM_escale;
    }

    public void setNUM_escale(String NUM_escale) {
        this.NUM_escale = NUM_escale;
    }

    public String getID_operation() {
        return ID_operation;
    }

    public void setID_operation(String ID_operation) {
        this.ID_operation = ID_operation;
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