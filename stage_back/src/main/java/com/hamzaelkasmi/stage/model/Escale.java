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
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MATRICULE_navire", nullable = false)
    private Navire navire;

    @Column(name = "DATE_accostage", nullable = false)
    private LocalDateTime DATE_accostage;

    @Column(name = "DATE_sortie", nullable = false)
    private LocalDateTime DATE_sortie;

    // Default constructor required by JPA/Hibernate
    public Escale() {
    }
    
    // Constructor with navire
    public Escale(String NOM_navire, Navire navire, LocalDateTime DATE_accostage, LocalDateTime DATE_sortie) {
        this.NOM_navire = NOM_navire;
        this.navire = navire;
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
    
    public Navire getNavire() {
        return navire;
    }

    public void setNavire(Navire navire) {
        this.navire = navire;
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
                ", navire=" + (navire != null ? navire.getMatriculeNavire() : "null") +
                ", DATE_accostage=" + DATE_accostage +
                ", DATE_sortie=" + DATE_sortie +
                '}';
    }
}