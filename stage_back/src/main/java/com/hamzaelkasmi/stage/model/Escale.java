package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;

@Entity
@Table(name = "escale")
public class Escale {

    @Id
    @GeneratedValue(generator = "escale-id")
    @GenericGenerator(
            name = "escale-id",
            strategy = "com.hamzaelkasmi.stage.generateure.EscaleIdGenerator"
    )
    @Column(name = "NUM_escale", nullable = false, unique = true)
    private String num_escale;

    @Column(name = "NOM_navire", nullable = false, length = 256)
    @JsonProperty("NOM_navire")
    private String NOM_navire;

    @Column(name = "MATRICULE_navire", nullable = false)
    @JsonProperty("matriculeNavire")
    private String MATRICULE_navire;

    @Column(name = "DATE_accostage", nullable = false)
    @JsonProperty("DATE_accostage")
    private LocalDateTime DATE_accostage;

    @Column(name = "DATE_sortie", nullable = false)
    @JsonProperty("DATE_sortie")
    private LocalDateTime DATE_sortie;

    // Default constructor required by JPA/Hibernate
    public Escale() {
    }

    // Constructor with all fields
    public Escale(String NOM_navire, String MATRICULE_navire, LocalDateTime DATE_accostage, LocalDateTime DATE_sortie) {
        this.NOM_navire = NOM_navire;
        this.MATRICULE_navire = MATRICULE_navire;
        this.DATE_accostage = DATE_accostage;
        this.DATE_sortie = DATE_sortie;
    }

    // Getters and Setters
    public String getNum_escale() {
        return num_escale;
    }

    public void setNum_escale(String num_escale) {
        this.num_escale = num_escale;
    }

    public String getNOM_navire() {
        return NOM_navire;
    }

    public void setNOM_navire(String NOM_navire) {
        this.NOM_navire = NOM_navire;
    }

    public String getMATRICULE_navire() {
        return MATRICULE_navire;
    }

    public void setMATRICULE_navire(String MATRICULE_navire) {
        this.MATRICULE_navire = MATRICULE_navire;
    }

    public LocalDateTime getDATE_accostage() {
        return DATE_accostage;
    }

    public void setDATE_accostage(LocalDateTime DATE_accostage) {
        this.DATE_accostage = DATE_accostage;
    }

    public LocalDateTime getDATE_sortie() {
        return DATE_sortie;
    }

    public void setDATE_sortie(LocalDateTime DATE_sortie) {
        this.DATE_sortie = DATE_sortie;
    }

    @Override
    public String toString() {
        return "Escale{" +
                "num_escale='" + num_escale + '\'' +
                ", NOM_navire='" + NOM_navire + '\'' +
                ", MATRICULE_navire='" + MATRICULE_navire + '\'' +
                ", DATE_accostage=" + DATE_accostage +
                ", DATE_sortie=" + DATE_sortie +
                '}';
    }
}