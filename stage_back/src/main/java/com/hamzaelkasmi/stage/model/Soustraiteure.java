package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Soustraiteure")
public class Soustraiteure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_soustraiteure")
    private int ID_soustraiteure;

    @Column(name = "MATRICULE_soustraiteure")
    private String MATRICULE_soustraiteure;

    @Column(name = "NOM_soustraiteure", nullable = false, length = 45)
    private String NOM_soustraiteure;

    @Column(name = "PRENOM_soustraiteure", nullable = false, length = 45)
    private String PRENOM_soustraiteure;

    @Column(name = "FONCTION_soustraiteure", nullable = false, length = 45)
    private String FONCTION_soustraiteure;

    // Constructors
    public Soustraiteure() {
    }

    public Soustraiteure(String NOM_soustraiteure, String PRENOM_soustraiteure, String FONCTION_soustraiteure) {
        this.NOM_soustraiteure = NOM_soustraiteure;
        this.PRENOM_soustraiteure = PRENOM_soustraiteure;
        this.FONCTION_soustraiteure = FONCTION_soustraiteure;
    }

    // Getters and Setters
    public int getID_soustraiteure() {
        return ID_soustraiteure;
    }

    public void setID_soustraiteure(int ID_soustraiteure) {
        this.ID_soustraiteure = ID_soustraiteure;
    }

    public String getMATRICULE_soustraiteure() {
        return MATRICULE_soustraiteure;
    }

    public void setMATRICULE_soustraiteure(String MATRICULE_soustraiteure) {
        this.MATRICULE_soustraiteure = MATRICULE_soustraiteure;
    }

    public String getNOM_soustraiteure() {
        return NOM_soustraiteure;
    }

    public void setNOM_soustraiteure(String NOM_soustraiteure) {
        this.NOM_soustraiteure = NOM_soustraiteure;
    }

    public String getPRENOM_soustraiteure() {
        return PRENOM_soustraiteure;
    }

    public void setPRENOM_soustraiteure(String PRENOM_soustraiteure) {
        this.PRENOM_soustraiteure = PRENOM_soustraiteure;
    }

    public String getFONCTION_soustraiteure() {
        return FONCTION_soustraiteure;
    }

    public void setFONCTION_soustraiteure(String FONCTION_soustraiteure) {
        this.FONCTION_soustraiteure = FONCTION_soustraiteure;
    }

    // toString method
    @Override
    public String toString() {
        return "Soustraiteure{" +
                "ID_soustraiteure=" + ID_soustraiteure +
                ", MATRICULE_soustraiteure='" + MATRICULE_soustraiteure + '\'' +
                ", NOM_soustraiteure='" + NOM_soustraiteure + '\'' +
                ", PRENOM_soustraiteure='" + PRENOM_soustraiteure + '\'' +
                ", FONCTION_soustraiteure='" + FONCTION_soustraiteure + '\'' +
                '}';
    }
}