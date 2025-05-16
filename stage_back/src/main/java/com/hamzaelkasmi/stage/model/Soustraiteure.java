package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "Soustraiteure")
public class Soustraiteure {    @Id
    @Column(name = "MATRICULE_soustraiteure", nullable = false)
    @GeneratedValue(generator = "soustraiteure-id-generator")
    @GenericGenerator(name = "soustraiteure-id-generator", strategy = "com.hamzaelkasmi.stage.generateure.SoustraiteureIdGenerator")
    private String MATRICULE_soustraiteure;

    @Column(name = "NOM_soustraiteure", nullable = false, length = 45)
    private String NOM_soustraiteure;

    @Column(name = "PRENOM_soustraiteure", nullable = false, length = 45)
    private String PRENOM_soustraiteure;

    @Column(name = "FONCTION_soustraiteure", nullable = false, length = 45)
    private String FONCTION_soustraiteure;
    
    @Column(name = "CONTACT_soustraiteure", length = 45)
    private String CONTACT_soustraiteure;
    
    @Column(name = "ENTREPRISE_soustraiteure", length = 100)
    private String ENTREPRISE_soustraiteure;

    // Constructors
    public Soustraiteure() {
    }

    public Soustraiteure(String NOM_soustraiteure, String PRENOM_soustraiteure, String FONCTION_soustraiteure) {
        this.NOM_soustraiteure = NOM_soustraiteure;
        this.PRENOM_soustraiteure = PRENOM_soustraiteure;
        this.FONCTION_soustraiteure = FONCTION_soustraiteure;
    }
    
    public Soustraiteure(String NOM_soustraiteure, String PRENOM_soustraiteure, String FONCTION_soustraiteure, 
                        String CONTACT_soustraiteure, String ENTREPRISE_soustraiteure) {
        this.NOM_soustraiteure = NOM_soustraiteure;
        this.PRENOM_soustraiteure = PRENOM_soustraiteure;
        this.FONCTION_soustraiteure = FONCTION_soustraiteure;
        this.CONTACT_soustraiteure = CONTACT_soustraiteure;
        this.ENTREPRISE_soustraiteure = ENTREPRISE_soustraiteure;
    }

    // Constructor with matricule (for updates)
    public Soustraiteure(String MATRICULE_soustraiteure, String NOM_soustraiteure, String PRENOM_soustraiteure, String FONCTION_soustraiteure) {
        this.MATRICULE_soustraiteure = MATRICULE_soustraiteure;
        this.NOM_soustraiteure = NOM_soustraiteure;
        this.PRENOM_soustraiteure = PRENOM_soustraiteure;
        this.FONCTION_soustraiteure = FONCTION_soustraiteure;
    }
    
    public Soustraiteure(String MATRICULE_soustraiteure, String NOM_soustraiteure, String PRENOM_soustraiteure, 
                        String FONCTION_soustraiteure, String CONTACT_soustraiteure, String ENTREPRISE_soustraiteure) {
        this.MATRICULE_soustraiteure = MATRICULE_soustraiteure;
        this.NOM_soustraiteure = NOM_soustraiteure;
        this.PRENOM_soustraiteure = PRENOM_soustraiteure;
        this.FONCTION_soustraiteure = FONCTION_soustraiteure;
        this.CONTACT_soustraiteure = CONTACT_soustraiteure;
        this.ENTREPRISE_soustraiteure = ENTREPRISE_soustraiteure;
    }

    // Getters and Setters
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
    
    public String getCONTACT_soustraiteure() {
        return CONTACT_soustraiteure;
    }
    
    public void setCONTACT_soustraiteure(String CONTACT_soustraiteure) {
        this.CONTACT_soustraiteure = CONTACT_soustraiteure;
    }
    
    public String getENTREPRISE_soustraiteure() {
        return ENTREPRISE_soustraiteure;
    }
    
    public void setENTREPRISE_soustraiteure(String ENTREPRISE_soustraiteure) {
        this.ENTREPRISE_soustraiteure = ENTREPRISE_soustraiteure;
    }

    // toString method
    @Override
    public String toString() {
        return "Soustraiteure{" +
                "MATRICULE_soustraiteure='" + MATRICULE_soustraiteure + '\'' +
                ", NOM_soustraiteure='" + NOM_soustraiteure + '\'' +
                ", PRENOM_soustraiteure='" + PRENOM_soustraiteure + '\'' +
                ", FONCTION_soustraiteure='" + FONCTION_soustraiteure + '\'' +
                ", CONTACT_soustraiteure='" + CONTACT_soustraiteure + '\'' +
                ", ENTREPRISE_soustraiteure='" + ENTREPRISE_soustraiteure + '\'' +
                '}';
    }
}