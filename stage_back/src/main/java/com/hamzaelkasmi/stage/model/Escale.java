package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "escale")
public class Escale {

    @Id
    @GeneratedValue(generator = "escale-id-generator")
    @GenericGenerator(
            name = "escale-id-generator",
            strategy = "com.hamzaelkasmi.stage.generateure.EscaleIdGenerator"
    )
    @Column(name = "NUM_escale", nullable = false, unique = true)
    private String num_escale;

    @Column(name = "NOM_navire", nullable = false, length = 256)
    private String NOM_navire;

    @Column(name = "DATE_accostage", nullable = false)
    private LocalDateTime DATE_accostage;

    @Column(name = "DATE_sortie", nullable = false)
    private LocalDateTime DATE_sortie;

    // Getters and Setters
    public String getNUM_escale() {
        return num_escale;
    }

    public void setNUM_escale(String num_escale) {
        this.num_escale = num_escale;
    }

    public String getNOM_navire() {
        return NOM_navire;
    }

    public void setNOM_navire(String NOM_navire) {
        this.NOM_navire = NOM_navire;
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

}